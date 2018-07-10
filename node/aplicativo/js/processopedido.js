var ip = getCookie("ip");
var socket = io.connect('http://'+ip+':3000');
//var socket = io.connect('http://localhost:3000');
var controle = true;
var i_s = 0;

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
var seletor = [];
$(document).ready(function(){
	$(".modal").modal({dismissible:false});
	 socket.emit('classes');
	
	socket.on('classes', function(data){
        var html = '';
		var classe = [...new Set(data.map(item => item.classe))];
        for(var i = 0; i < classe.length; i++){
			seletor[i] = '<option value="" disabled selected>'+classe[i].toUpperCase()+'</option>';
            html += '<button id="'+i+'" type="button" class="btn btclasses">'+ classe[i] +'</button>';
			for(var y = 0; y < data.length; y++){
				if(data[y].classe == classe[i]){
					if(data[y].estado != 1){
						seletor[i] += '<option value="'+data[y].item+'" disabled> '+data[y].item+' - (Valor: R$ '+data[y].valor+') <span class="red-text">Em Falta!</span></option>';
					}else{
						seletor[i] += '<option value="'+data[y].item+'" > '+data[y].item+' - (Valor: R$ '+data[y].valor+')</option>';
					}
				}
			}
		}
		
        $('#classes').html(html);
		
		seletores();
    })
	
	
	$('#remove').click(function(){
		var pai = document.getElementById("pedido");
		var ultimoFilho = pai.lastElementChild;
		ultimoFilho.remove();
		if(i_s > 0){
			i_s--;
		}
    })
	
	 $('#comanda').blur(function(){
		let comanda = $('#comanda').val()
		socket.emit('busca_nome', {"comanda":comanda}, function(data){
			if(data.status){
				$("#enviar").removeClass("disabled");
				$("#status").html("<span style='color:white'>NOME: "+data.nome.toUpperCase()+"</span>");
			}else{
				$("#status").html("<span style='color:yellow'>COMANDA NÃO CADASTRADA!</span>");
				$("#enviar").addClass("disabled");
			}
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
})

function seletores(){
	$('.btclasses').click(function(event){
		let dados = '';
		id = event.target.id;
		dados = '<span><select  class="col s8 pedidos" id="pedido'+i_s+'">'+seletor[id]+'</select><select class="col s4" id="quantidade'+i_s+'"><option value="" disabled>Quantidade</option><option selected>1</option><option>2</option><option>3</option><option>4</option><option>5</option><option>6</option><option>7</option><option>8</option><option>9</option><option>10</option></select></span>';
		$('#pedido').append(dados);
		i_s++;
	})
	
}

var nome;
var mesa;
			
$(function($) {
				$("#envia").submit(function() {
					var comanda = $("#comanda").val();
					var mesa = $("#mesa").val();
					
					if(comanda != '' && mesa != ''){
						var obs = $("#observacao").val();
						var pedido = [];
						$( "#pedido span" ).each(function(e){
							if($("#pedido"+e).val() != null){
								pedido.push({pedidos: $("#pedido"+e).val(),qt: $("#quantidade"+e).val()});
							}
						});
					
						pedido = JSON.stringify(pedido, null);
						
						if ($("#pedido select" ).length != 0){
							$("#status").html('<div class="progress"><div class="indeterminate"></div></div>');
						
							socket.emit('pedido',{"comanda": comanda,"mesa":mesa,"pedido":pedido,"obs":obs,usuario:getCookie("nome")}, function(data){
								if(data){
									$( "#pedido").html('');
									i_s = 0;
									$("#status").html("<span style='color:white'>PEDIDO REALIZADO COM SUCESSO!</span>");	
								}else{
									$("#status").html("<span style='color:red'>ERRO AO REALIZAR O PEDIDO!</span>");	
								}
							});
						}else{
							$("#status").html("<span style='color:red'>SELECIONE O PEDIDO!</span>");
						}
					}else{
						$("#status").html("<span style='color:red'>DIGITE A COMANDA OU A MESA!</span>");
					}
				});
			});
	
function abreobs(){
	$('#obs').modal('open');
}
