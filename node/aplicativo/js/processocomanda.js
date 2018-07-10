var ip = getCookie("ip");
var socket = io.connect('http://'+ip+':3000');
//var socket = io.connect('http://localhost:3000');

socket.on('connect_error', function() {
	if(controle){
		Materialize.toast('Problemas ao Conectar ao Nucleo!', 4000);
		controle = false;
	}
})
	
socket.on('connect', () => {
	Materialize.toast('Conectado ao Nucleo!', 4000);
	controle = true;
});
$(document).ready(function() {
	$(".modal").modal({dismissible:false});
	$('#pesquisa_nome').keydown(function(){
		$("#retorno_busca_nome").html('<div class="preloader-wrapper small active"><div class="spinner-layer spinner-green-only"><div class="circle-clipper left"><div class="circle"></div></div><div class="gap-patch"><div class="circle"></div></div><div class="circle-clipper right"><div class="circle"></div></div></div></div>');		
		let nome = $('#pesquisa_nome').val();
		socket.emit('busca_cadastro', {"nome":nome}, function(data){
			let html = '<table class="centered highlight responsive-table"><thead><tr class="azul white-text"><th>Nome</th><th>Telefone</th><th>E-mail</th></tr></thead><tbody>';
			if(data.status){
				let dados = data.dados;
				for(var i = 0;i < dados.length;i++){
					html += "<tr id='"+dados[i].id+"' class='user_local'><td>"+dados[i].nome+"</td><td>"+dados[i].fone+"</td><td>"+dados[i].email+"</td></tr>"
				}
			}else{
				html = '';
			}
			html += '</tbody></table>';
			$("#retorno_busca_nome").html(html);
			$(".user_local").click(function(){
				let dados = [];
				let i=0;
				$("#envia").data('novo', false);
				$("#envia").data('id', this.id);
				$("#"+this.id+" td").each(function(){
					dados[i] = $(this).text();
					i++;
				})
				$(".input-field label").addClass("active");
				$("#nome").val(dados[0]);
				$("#telefone").val(dados[1]);
				$("#dependentes").val(dados[2]);
				$("#email").val(dados[3]);
				$(".modal").modal("close");			
			});
		});
	});

	$("#salvar_p_senha").click(function(){
		let login = getCookie("nome");
		let senha = $("#v_p_senha").val();
		let c_senha = $("#v_c_p_senha").val();
		let resultado;
		if(senha != "" && c_senha != ""){
			if(senha != c_senha){
				Materialize.toast("As senhas não são iguais!",4000);
			}else{
				socket.emit('p_senha',{login:login,senha:senha}, function(data){
					if(data == 1){
						Materialize.toast("Senha incluida com sucesso!",4000);
						Android.senha("false");
					}else{
						Materialize.toast("Problemas ao realizar a ação!",4000);
					}
					$("#p_senha").modal("close");
				});
			}
		}else{
			Materialize.toast("Digite as senhas!",4000);
		}
	});
});
$(function($) {
	$("#envia").submit(function() {
		let usuario = getCookie("nome");
		let comanda = $("#comanda").val();
		let nome = $("#nome").val();
		let numero = $("#telefone").val();
		let dependentes = $("#dependentes").val();
		let email = $("#email").val();
		$("#status").html('<div class="progress"><div class="indeterminate"></div></div>Enviado...');
		socket.emit('comanda',{usuario:usuario,novo:$(this).data('novo'),id:$(this).data('id'),"comanda": comanda,"nome": nome,"numero": numero,"dependentes": dependentes,"email": email}, function(data){
		if(!data.status){
			$("#status").html("<span style='color:yellow'>"+data.msg.toUpperCase()+"</span>");	
		}else{
			$("#status").html("<span style='color:white'>COMANDA CADASTRADA COM SUCESSO!</span>");
			$("#comanda").val("");
			$("#nome").val("");
			$("#telefone").val("");
			$("#dependentes").val("");
			$("#email").val("");
			$("#envia").data('novo', true);
		}
	});
	});
});
