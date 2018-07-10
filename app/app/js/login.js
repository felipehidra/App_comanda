const {ipcRenderer} = require('electron')
var ip_server;
$(document).ready(function(){
	//Materialize.updateTextFields();
	ipcRenderer.send('ip');
    $('.modal').modal();
	
	$("#salvar_ip").click(function(){
	ipcRenderer.send('salvar_ip',$('#ip').val());
	ip_server = $('#ip').val();
	});
	
	$("#adm_entrar").click(function(){
	var senha_ale = '';
	var senha_al = $('#aleatorio').html().split('');
	var senha_adm = $('#senha_adm').val();
	for(i = 0;i < senha_al.length;i++){
		senha_ale += (senha_al[i]*2);
	}
	if(senha_adm == senha_ale){
		ipcRenderer.send('ADM');
	}
	});
	
$("#salvar_p_senha").click(function(){
		let login = $('#login').val();
		let senha = $("#v_p_senha").val();
		let c_senha = $("#v_c_p_senha").val();
		let resultado;
		if(senha != "" && c_senha != ""){
			if(senha != c_senha){
				M.toast({html: "As senhas não são iguais!"});
			}else{
				resultado = ipcRenderer.sendSync('p_senha', {login:login,senha:senha});
				if(resultado == 1){
					M.toast({html: "Realize o Login com a nova senha!"});
				}else{
					M.toast({html: "Problemas ao realizar a ação!"});
				}
				$("#p_senha").modal("close");
			}
		}else{
			M.toast({html: "Digite as senhas!"});
		}
	});
	
	if(localStorage.getItem("login") != "" && localStorage.getItem("senha") != ""){
		$('#login').val(localStorage.getItem("login"));
		$('#senha').val(localStorage.getItem("senha"));
		$("#lembrar").prop("checked",true);
		$(".input-field label").addClass("active");
	}
  });
   $("#logar").click(function(){
	$("#mensagem").html('<div class="progress"><div class="indeterminate"></div></div>')
	login = $('#login').val();
	senha = $('#senha').val();
	if(login == "" && senha == ""){
	$("#mensagem").html("<span class='red-text'>Digite seu Login ou Senha!</span>");
	}else{
	$.post('http://'+ip_server+':4000/login',{login:login,senha:senha,app:"app1"},function(resultado){
		resultado = JSON.parse(resultado);
		if(resultado.status == "true"){
			if($("#lembrar").is(":checked")){
				localStorage.setItem("login", login);
				localStorage.setItem("senha", senha);
			}else{
				localStorage.setItem("login", '');
				localStorage.setItem("senha", '');
			}
			$("#mensagem").html("<span class='green-text'>Bem Vindo!</span>");
			ipcRenderer.send('login',{login:login,dados:resultado.dados});
		}else if(resultado.status == "acesso"){
			$("#mensagem").html("<span class='red-text'>Você não tem acesso ao aplicativo!</span>");
		}else if(resultado.status == "senha"){
			$("#mensagem").html('');
			$("#p_senha").modal("open");
		}else{
			$("#mensagem").html("<span class='red-text'>Dados de acesso Incorretos!</span>");
		}
	});
	}
 });
  ipcRenderer.on('ip', (event, arg) => {
   $('#ip').val(arg);
   ip_server = arg;
  })
  ipcRenderer.on('salvar_ip', (event, arg) => {
   $('#mensagem').html("<span class='green-text'>"+arg+"</span>");
  })
  ipcRenderer.on('abre_modal', (event) => {
    $('#modal1').modal('open'); 
  })
  
  ipcRenderer.on('abre_modal2', (event) => {
	$('#aleatorio').html(rand(10000,99999));
    $('#modal2').modal('open'); 
  })
function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}

function falha_conecta(status){
	if(status){
		$('#logar').prop("disabled", false);
		$('.alerta').css('background-color','#00FF00');
		$('#mensagem').html("");
	}else{
		$('#logar').prop("disabled", true);
		$('.alerta').css('background-color','red');
		$('#mensagem').html("<span class='red-text'>Nucleo Offline!</span>");
	}
}