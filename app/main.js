const {app, Menu, Tray, BrowserWindow, ipcMain, globalShortcut,webContents} = require('electron')
const userInfo = require('user-info');
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
    return console.log("Erro ao ler arquivo");
	}
	Conf = JSON.parse(data);
	ip = Conf.ip;
	porta = Conf.porta;
	IniciaSocket();
});
  
  function createWindow () {
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
	  salvar_log('Saiu  ');
      Prin = null
    })
	
	conteudoprin = Prin.webContents
	
	controle = true;
	Prin.once('ready-to-show', () => {
    Prin.show();
	})
	IniciaSocket();
  }


  
app.on('ready', function () {
	createWindow()
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
      createWindow()
    }
  })
notifier.show;

	ipcMain.on('login', (event,data) => {
		salvar_log('Entrou');
		dados_usuario = data.dados;
		Principal();
		win.close();
	});

	ipcMain.on('close',() => {
		createWindow();
	});

	ipcMain.on('dados_usuario', (event,data) => {
			event.returnValue = dados_usuario;
			console.log(dados_usuario);
	})

	ipcMain.on('conect_fail', (event) => {
		notifier.notify({
		title: "App-Central",
		message: "Erro de conexão ao banco de dados! Favor verificar e reiniciar a aplicação.",
		sound: true,
		icon: __dirname+'/app/imagem/logo-web.png',
		timeout: 60,
		});
	})
  ipcMain.on('ip', (event, arg) => {
    event.sender.send('ip', ip)
  })
  
  ipcMain.on('salvar_ip', (event, arg) => {
	fs.writeFile(arquivo, arg,{enconding:'utf-8',flag: 'w'}, function (err) {
    if (err) throw err;
    event.sender.send('salvar_ip', "IP salvo com sucesso!");
	});
  });
  
  ipcMain.on('ADM',(event) => {
	salvar_log('Entrou');
	dados_usuario = [ { acesso: 1, acesso1: 1, acesso2: 1, acesso3: 1, acesso4: 1, acesso5: 1, acesso6: 1, app1: 1, app2: 1, app3: 1, foto: 'imagem/fundo.png', id: 18, nome: 'ADM', setor: '1' } ]
    Principal();
	win.close();
  })
    
  ipcMain.on('mesa',(event) => {
	socket.emit('mesa', function(){});
  })
	ipcMain.on('gera_mesas',(event,data) => {
		socket.emit('gera_mesas',data, function(data){
			event.returnValue = data;
		});
	});
	
	ipcMain.on('busca_pedido',(event,data) => {
	socket.emit('busca_pedido',data, function(dados){
	event.returnValue = dados;
	});
	});
	
	ipcMain.on('importa_arquivo',(event,data) => {
		socket.emit('importa_arquivo',data,function(dados){
			event.returnValue = dados;
		});
	});
	
	ipcMain.on('limpa_classe',(event,data) => {
		socket.emit('limpa_classe',data,function(dados){
			event.returnValue = dados;
		});
	});
	
	ipcMain.on('classes',(event,data) => {
		socket.emit('classes_main',data,function(dados){
			event.returnValue = dados;
		});
	})
	
	ipcMain.on('item_ativo',(event,data) => {
		socket.emit('item_ativo',data,function(dados){
			event.returnValue = dados;
		});
	})
	
	ipcMain.on('deleta_item',(event,data) => {
		socket.emit('deleta_item',data,function(dados){
			event.returnValue = dados;
		});
	})
  
	ipcMain.on('exclui_mesa',(event,data) => {
		console.log(data);
		socket.emit('exclui_mesa',data, function(resultado){
			event.returnValue = resultado;
		});
	}) 

	ipcMain.on('salva_usuario',(event,data) => {
		socket.emit('salva_usuario',data, function(resultado){
			event.returnValue = resultado;
		});
	});

	ipcMain.on('excluir_usuario',(event,data) => {
		socket.emit('excluir_usuario',data, function(resultado){
			event.returnValue = resultado;
		});
	});

	ipcMain.on('busca_generica',(event,data) => {
		socket.emit('busca_generica',data, function(resultado){
			event.returnValue = resultado;
		});
	}) 

	ipcMain.on('p_senha',(event,data) => {
		socket.emit('p_senha',data, function(resultado){
			event.returnValue = resultado;
		});
	})
	
	ipcMain.on('exclui_pedido',(event,data) => {
		socket.emit('exclui_pedido',data, function(resultado){
			event.returnValue = resultado;
		});
	})


	ipcMain.on('salva_p_mesa',(event,data) => {
		socket.emit('salva_p_mesa',data, function(data){
			event.returnValue = data;
		});
	})   
//-------------- funções ----------------
function salvar_log(porta){
	data = new Date;
	var texto = porta+" | " + data.getDate() + "/" + (data.getMonth()+1) + "/" + data.getFullYear()+ " - " +data.getHours()+ ":"+ data.getMinutes()+" | "+userInfo().username+"\n"; 
	fs.writeFile('C:/Hidratech/Logs/log_acesso.txt', texto,{enconding:'utf-8',flag: 'a+'}, function (err) {
    if (err) throw err;
	});
}
	
function IniciaSocket(){
socket = require('socket.io-client')('http://'+ip+':'+porta);
socket.on('connect', function(){
	console.log('Conectado ao Nucleo');
	if(!controle){
	conteudowin.executeJavaScript('falha_conecta(true)');
	}
}).on('connect_error', (error) => {
	console.log('Erro ao conectar ao Nucleo');
    if(!controle){
	conteudowin.executeJavaScript('falha_conecta(false)');
	}
 });

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

socket.on('banco', function(data){
	if(!controle){
		if(data){
			conteudowin.executeJavaScript('falha_conecta(true)');
		}else{
			conteudowin.executeJavaScript('falha_conecta(false)');
		}
	}
});

socket.on('disconnect', function(){
console.log('Nucleo Perdido');
});
}