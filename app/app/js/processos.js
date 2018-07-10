var dados_usuario = ipcRenderer.sendSync('dados_usuario'); 

var editando = true;
var setor_usuario;

$("#corpo").load("paginas/mesas.html");
$(document).ready(function(){
$('.sidenav').sidenav({
	draggable:true
});
$(".modal").modal();
$('.dropdown-trigger').dropdown({alignment: 'right'});
$('.opcoes').click(function(e){
	if(e.target.id == "op1"){
	$("#corpo").load("paginas/mesas.html");
	ipcRenderer.send('mesa');
	}
	if(e.target.id == "op2"){
		if(dados_usuario[0].acesso6 == 1){
			$("#corpo").load("paginas/apps.html");
		}else{
			M.toast({html: 'Você não tem acesso a esta função!'});
		}
	}
	if(e.target.id == "op3"){
		if(dados_usuario[0].app1 == 1){
			$("#corpo").load("paginas/reservas.html");
		}else{
			M.toast({html: 'Você não tem acesso a esta função!'});
		}
	}
	if(e.target.id == "op4"){
		if(dados_usuario[0].acesso1 == 1){
			$("#corpo").load("paginas/usuarios.html");
		}else{
			M.toast({html: 'Você não tem acesso a esta função!'});
		}
	}
	if(e.target.id == "op5"){
		if(dados_usuario[0].acesso2 == 1){
			$("#corpo").load("paginas/estoque.html");
		}else{
			M.toast({html: 'Você não tem acesso a esta função!'});
		}
	}
	if(e.target.id == "op6"){
		if(dados_usuario[0].acesso6 == 1){
			$("#corpo").load("paginas/relatorio.html");
		}else{
			M.toast({html: 'Você não tem acesso a esta função!'});
		}
	}
	if(e.target.id == "op7"){
		if(dados_usuario[0].acesso1 == 1){
			$("#corpo").load("paginas/clientes.html");
		}else{
			M.toast({html: 'Você não tem acesso a esta função!'});
		}
	}
	if(e.target.id == "op8"){
		if(dados_usuario[0].acesso4 == 1){
			$("#corpo").load("paginas/caixa.html");
		}else{
			M.toast({html: 'Você não tem acesso a esta função!'});
		}
	}
	if(e.target.id == "op9"){
		if(dados_usuario[0].acesso5 == 1){
			$("#corpo").load("paginas/bd.html");
		}else{
			M.toast({html: 'Você não tem acesso a esta função!'});
		}
	}
	if(e.target.id == "op10"){
		if(dados_usuario[0].acesso6 == 1){
			$("#corpo").load("paginas/painel.html");
		}else{
			M.toast({html: 'Você não tem acesso a esta função!'});
		}
	}
	if(e.target.id == "op11"){
		if(dados_usuario[0].acesso6 == 1){
			$("#corpo").load("paginas/app.html");
		}else{
			M.toast({html: 'Você não tem acesso a esta função!'});
		}
	}
	if(e.target.id == "op12"){
		if(dados_usuario[0].acesso6 == 1){
			$("#corpo").load("paginas/app-clientes.html");
		}else{
			M.toast({html: 'Você não tem acesso a esta função!'});
		}
	}
});

$("#close").click(function(){
	ipcRenderer.send('close');
	window.close();
});

$("#foto_usuario").attr("src",dados_usuario[0].foto);
$("#nome_usuario").html(dados_usuario[0].nome.toUpperCase());
$("#setor_usuario").html(setor_usuario.toUpperCase());
});

if(dados_usuario[0].setor == 1){
	setor_usuario = "Administração";
}else if(dados_usuario[0].setor == 2){
	setor_usuario = "Caixa";
}else if(dados_usuario[0].setor == 3){
	setor_usuario = "Garçom";
}

function mesas(mesa){
	$('#campo').html(mesa);
}