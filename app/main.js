const {app, Menu, Tray, BrowserWindow, ipcMain, globalShortcut,webContents} = require('electron')
const userInfo = require('user-info');
var data = require("moment");
var socket;
const notifier = require('node-notifier');
const path = require('path')
const url = require('url')
var fs = require('fs');  
var arquivo = "C:/Hidratech/conf.hidra";
var ip;
var porta;
var Conf;
var conteudowin;
var conteudoprin;
var mesas;
var controle = false;
var controle_janela = true;
var dados_usuario;
var win;
var Prin;
let tray = null
var usuario = 'felipe';

fs.readFile(arquivo, 'utf-8', function (err, data) {
	if(err){
	log(3,"Erro ao ler arquivo");
    return console.log("Erro ao ler arquivo");
	}
	Conf = JSON.parse(data);
	ip = Conf.ip;
	porta = Conf.porta;
	IniciaSocket();
});

// Chama a tela de Login
function Login() {
	win = new BrowserWindow({show: false,backgroundColor: '#002951',frame: false,resizable:false, width: 600, height: 500, icon:__dirname+'/app/imagem/logo-web.png'})
	win.setMenu(null);
	win.loadURL(url.format({
		pathname: path.join(__dirname,'app/login.html'),
		protocol: 'file:',
		slashes: true
	}))
  // Abre o DevTools.
	//win.webContents.openDevTools()
	conteudowin = win.webContents
	win.once('ready-to-show', () => {
    win.show();
	})
	
}

// Chama a tela Principal da Aplicação
function Principal () {
	socket.emit('usuario',usuario);
	controle_janela = false;
	Prin = new BrowserWindow({show: false,title: "Hidratech",width: 1440, width: 900, icon:__dirname+'/app/imagem/logo-web.png'});
	Prin.setMenu(null);
	Prin.maximize();
	Prin.loadURL(url.format({
		pathname: path.join(__dirname,'app/central.html'),
		protocol: 'file:',
		slashes: true
	}))
	
	notifier.notify({
		title: "App-Central",
		message: "Bem Vindo ao App-Central!",
    sound: false,
    icon: __dirname+'/app/imagem/logo-web.png',
    timeout: 5,
	});   
	
	Prin.on('closed', () => {
		log(1,'Usuário '+dados_usuario[0].nome+' saiu');
		Prin = null
	})
	
	conteudoprin = Prin.webContents
	
	controle = true;
	Prin.once('ready-to-show', () => {
    Prin.show();
	})
	IniciaSocket();
}

//Cria alguns metodos depois de carregar o App
app.on('ready', function () {
	Login();
	//Cria os atalhos de teclas
	globalShortcut.register('CommandOrControl+Alt+H', function () {
		win.webContents.send('abre_modal2');
	})
	
	globalShortcut.register('CommandOrControl+Alt+L', function () {
		if(controle_janela){
			win.webContents.openDevTools()
		}else{
			Prin.webContents.openDevTools();
		}	
	})
	
	//Cria um menu ao lado do Relogio
	tray = new Tray(__dirname+'/app/imagem/logo-web.png');
    const contextMenu = Menu.buildFromTemplate([{label: 'Conexão',click: function () {
			win.webContents.send('abre_modal')
		}},{label: 'Minimizar',click: function () {
			win.minimize();
		}}])
    tray.setToolTip('Opções do App-Central')
	tray.setTitle('App-Central')
    tray.setContextMenu(contextMenu)
})
  
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
})
  
app.on('activate', () => {
	if (win === null) {
		Login()
	}
})

// Metodos que são chamados a partir da tela...(Chamadas JavaScripts)
// chama a ela principal depois de verificar o login
ipcMain.on('login', (event,data) => {
	log(1,'Usuário '+data.dados[0].nome+' entrou');
	dados_usuario = data.dados;
	Principal();
	win.close();
});
// Chama o Login depois do LogOff
ipcMain.on('close',() => {
	log(1,'Usuário '+dados_usuario[0].nome+' realizou logoff');
	Login();
});
// Busca os dados do usuário logado no Nucleo e envia para a tela
ipcMain.on('dados_usuario', (event,data) => {
	event.returnValue = dados_usuario;
})
// Em caso de falha de conexão exibe uma mensagem
ipcMain.on('conect_fail', (event) => {
	log(3,'Erro de conexão ao banco de dados');
	notifier.notify({
		title: "App-Central",
		message: "Erro de conexão ao banco de dados! Favor verificar e reiniciar a aplicação.",
		sound: true,
		icon: __dirname+'/app/imagem/logo-web.png',
		timeout: 60,
	});
})
//Obtem o ip do Nucleo
ipcMain.on('ip', (event, arg) => {
	event.sender.send('ip', ip)
})
//Salva o ip do nucleo
ipcMain.on('salvar_ip', (event, arg) => {
	fs.writeFile(arquivo, arg,{enconding:'utf-8',flag: 'w'}, function (err) {
		if (err) throw err;
    	event.sender.send('salvar_ip', "IP salvo com sucesso!");
	});
});
//Caso a aplicação seja acessado com o ADM
ipcMain.on('ADM',(event) => {
	log(1,'Acesso com o ADM');
	dados_usuario = [ { acesso: 1, acesso1: 1, acesso2: 1, acesso3: 1, acesso4: 1, acesso5: 1, acesso6: 1, app1: 1, app2: 1, app3: 1, foto: 'imagem/fundo.png', id: 18, nome: 'ADM', setor: '1' } ]
    Principal();
	win.close();
})
// Envia as mesas para a tela principal    
ipcMain.on('mesa',(event) => {
	try{
		socket.emit('mesa', function(){});
	}catch(e){
		log(3,"Erro de conexão ao Nucleo");
	}
})
// Gera as mesas e retorna para a tela o resultado
ipcMain.on('gera_mesas',(event,data) => {
	try{
		socket.emit('gera_mesas',data, function(data){
			event.returnValue = data;
		});
	}catch(e){
		log(3,"Erro de conexão ao Nucleo");
		event.returnValue = false;
	}
});
// Busca o pedido e envia para a tela 
ipcMain.on('busca_pedido',(event,data) => {
	try{
		socket.emit('busca_pedido',data, function(dados){
			event.returnValue = dados;
		});
	}catch(e){
		log(3,"Erro de conexão ao Nucleo");
		event.returnValue = false;
	}
});
//Importa as classes via arquivo e retorna o resultado para a tela
ipcMain.on('importa_arquivo',(event,data) => {
	try{
		socket.emit('importa_arquivo',data,function(dados){
			event.returnValue = dados;
		});
	}catch(e){
		log(3,"Erro de conexão ao Nucleo");
		event.returnValue = false;
	}
});
//Exclui uma classe e retorna o resultado para a tela
ipcMain.on('limpa_classe',(event,data) => {
	try{
		socket.emit('limpa_classe',data,function(dados){
			event.returnValue = dados;
		})
	}catch(e){
		log(3,"Erro de conexão ao Nucleo");
		event.returnValue = false;
	}
});
//Busca as classes no Nucleo e envia o resultado para a tela	
ipcMain.on('classes',(event,data) => {
	try{
		socket.emit('classes_main',data,function(dados){
			event.returnValue = dados;
		})
	}catch(e){
		log(3,"Erro de conexão ao Nucleo");
		event.returnValue = false;
	}
})
//Ativa ou desativa um item e envia o resultado para a tela
ipcMain.on('item_ativo',(event,data) => {
	wait(event);	
	socket.emit('item_ativo',data,function(dados){
		event.returnValue = dados;
	})
})
//Deleta um item e envia o resultado para a tela
ipcMain.on('deleta_item',(event,data) => {
	socket.emit('deleta_item',data,function(dados){
		event.returnValue = dados;
	});
})
//Exclui uma mesa e envia o resultado para a tela
ipcMain.on('exclui_mesa',(event,data) => {
	socket.emit('exclui_mesa',data, function(resultado){
		event.returnValue = resultado;
	});
}) 
//Salva os dados de um novo usuario e envia o resultado para a tela
ipcMain.on('salva_usuario',(event,data) => {
	socket.emit('salva_usuario',data, function(resultado){
		event.returnValue = resultado;
	});
});
//Exclui um usuário e envia o resultado para a tela
ipcMain.on('excluir_usuario',(event,data) => {
	socket.emit('excluir_usuario',data, function(resultado){
		event.returnValue = resultado;
	});
});
//Os comandos SQL são recebidos da interface e envia o resultado para a tela
ipcMain.on('busca_generica',(event,data) => {
	socket.emit('busca_generica',data, function(resultado){
		event.returnValue = resultado;
	});
}) 
//Salva a senha do primeiro acesso e envia o resultado para a tela
ipcMain.on('p_senha',(event,data) => {
	socket.emit('p_senha',data, function(resultado){
		event.returnValue = resultado;
	});
})
//Exclui o pedido e envia o resultado para a tela	
ipcMain.on('exclui_pedido',(event,data) => {
	socket.emit('exclui_pedido',data, function(resultado){
		event.returnValue = resultado;
	});
})
//Salva a posição da mesa e envia o resultado para a tela
ipcMain.on('salva_p_mesa',(event,data) => {
	socket.emit('salva_p_mesa',data, function(data){
		event.returnValue = data;
	});
})   
/*-------------- funções ----------------*/
//Salva uma log em um arquivo txt
function log(flag,msg){
	switch(flag) {
		case 1:
			flag = "Info";
			break;
		case 2:
			flag = "Warning";
			break;
		case 3:
			flag = "Error";
			break;
		default:
			flag = "Info";
	} 
	var texto = flag+" | "+msg + " | "+data().format("DD/MM/YYYY - HH:mm")+" | "+userInfo().username+"\n"; 
	fs.writeFile(__dirname+'/Log_App_Comanda.txt', texto,{enconding:'utf-8',flag: 'a+'}, function (err) {
		if (err) throw err;
	});
}
//Retorna false caso o socket não responda
function wait(event){
	setTimeout(() => {
		log(3,"Erro de conexão do Socket");
		event.returnValue = false;	
	}, 5000);
}
//Inicia a conexão com o Nucleo.	
function IniciaSocket(){
	//Conecta ao Nucleo
	socket = require('socket.io-client')('http://'+ip+':'+porta);
	//Verifica a conexão
	socket.on('connect', function(){
		if(!controle){
			log(1,"Conectado ao Nucleo");
			conteudowin.executeJavaScript('falha_conecta(true)');
		}
	}).on('connect_error', (error) => {
    	if(!controle){
			log(3,"Erro ao conectar ao Nucleo");
			console.log('Erro ao conectar ao Nucleo');
			conteudowin.executeJavaScript('falha_conecta(false)');
		}
 	});
	//Recebe as mesas do Nucleo, processa as mesmas e envia o resultado para a tela
	socket.on('mesas', function(data){
		var html = ''
		if(data.length > 0){
			for (var i = 0; i < data.length; i++){
				if(data[i].status){
					html += '<div id="'+ data[i].mesa +'" class="cbtn mesa center-align darken-4 white-text z-depth-3" onclick="AbrePedido('+ data[i].mesa +');" style="background:red;color:white;'+ data[i].local +'"><i class="material-icons medium">restaurant</i>'+ data[i].mesa +'</div>'; 
				}else{
					html += '<div id="'+ data[i].mesa +'" class="cbtn mesa center-align blue darken-4 white-text z-depth-3" style="'+ data[i].local +'"><i class="material-icons medium">restaurant</i>'+ data[i].mesa +'</div>';
				}
			}
		}else{
			html ="<h4>Não existem Mesas cadastradas!</h4>";
		}
		if(controle){
  			conteudoprin.executeJavaScript("mesas('"+html+"');")
  		}
	});
	//Verifica se o nucleo conseguiu conectar ao bando de dados e envia o resultado para a tela
	socket.on('banco', function(data){
		if(!controle){
			if(data){
				conteudowin.executeJavaScript('falha_conecta(true)');
			}else{
				conteudowin.executeJavaScript('falha_conecta(false)');
			}
		}
	});
	//Quando perde a conexão ao Nucleo, grava na log o resultado.
	socket.on('disconnect', function(){
		console.log('Conexão com Nucleo Perdido');
	});
}