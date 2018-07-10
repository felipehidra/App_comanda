var ip = localStorage.getItem("ip");
var controle = true;
var i_s = 0;
var socket;
var numero_pedidos = 0;
var primeiro_pedido;
var control = 0;

$(document).ready(function(){
	$(".modal").modal({dismissible:false});
	$('.scrollspy').scrollSpy();
	$('#salvar_ip').click(function(){
		ip =  $("#ip").val();
		if(ip == ''){
			Materialize.toast('Digite o IP valido!', 4000);
		}else{
			localStorage.setItem("ip",ip);
			Materialize.toast('IP Salvo com Sucesso!', 4000);
			$("#alerta").modal("close");
			conecta();
		}
	})
	$(document).keydown(function(e){
		if(e.keyCode == 13){
			if(control == 0){
				$("#titulo").html("Atenção!")
				$("#alerta .modal-content").html("<h4>Este pedido foi finalizado?</h4><h5>Tecle ENTER novamente para confirmar:</h5>");
				$("#alerta").modal("open");
				control = 1;
			}else if(control == 1){
				control = 0;
				$("#alerta").modal("close");
				socket.emit('entregar_pedido', primeiro_pedido, function(data){
					if(data){
						Materialize.toast('Pedido Entregue!', 4000);
					}else{
						Materialize.toast('Problemas ao realizar o processo!', 4000);
					}
				});
			}
			setTimeout(function(){
				control = 0;
				$("#alerta").modal("close");
			},5000);
		}
	});
	if(ip == null){
		$("#alerta").modal("open");
	}else{
		conecta();
	}
});
function conecta(){
socket = io.connect('http://'+ip+':3000');
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
		socket.on('painel', function(data){
			let html = "<h4>Em processo:</h4><div class='card'>";
			let fila = '';
			if(numero_pedidos < data.length){
				let alerta = new Audio();
    			alerta.src = "audio/alerta.mp3";
    			alerta.play();
			}
			for(var i = 0; i < data.length; i++){
				if(i == 0){
					primeiro_pedido = data[i].id;
					html += "<div class='center-align container'><h3 class='col s6'>Pedido: "+data[i].id+"</h3><h3 class='col s6'>Comanda: "+data[i].comanda+"</h3>"; 
					html += '<table class="centered striped responsive-table white"><thead class="azul white-text"><tr><th style="width:10%;">QUANTIDADE</th><th>ITEM</th></tr></thead><tbody>';
					let dados = JSON.parse(data[i].item);
					for(var y=0;y < dados.length;y++){
						html += "<tr><td>"+dados[y].qt+"</td><td>"+dados[y].pedidos+"</td></tr>";
					}
					html += '</tbody></table></div><div class="rodape azul"><div class="col s6">Usuário: '+data[i].usuario+'</div><div class="col s6">Hora: '+data[i].hora+'</div></div></div>';
					$("#campo").html(html);
				}else if(i == 1){
					$("#proximo").html("<h4>Proximo Pedido:</h4><table class='centered striped white'><thead class='azul white-text'><tr><th>PEDIDO</th><th>COMANDA</th><th>MESA</th></tr></thead><tbody><tr><td>"+data[i].id+"</td><td>"+data[i].comanda+"</td><td>"+data[i].mesa+"</td></tr></tbody></table>");
				}else{
					fila += '<li class="collection-item">Pedido: '+data[i].id+' -- Comanda: '+data[i].comanda+'  --  Mesa: '+data[i].mesa+'</li>';
				}
			}
			$("#fila").html(fila);
			numero_pedidos = data.length;
		})
	}