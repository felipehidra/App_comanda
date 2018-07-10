editando = true;
controle = true;
controle_m = true;
$(document).ready(function(){
$(".dropdown-trigger").dropdown();
$('.modal').modal();
	$('#reserva').click(function(){
		$(".body").css('display','block');
		atualizacorporeserva();
	});
	atualizareserva();

	$('#modal3 .modal-close').click(function(){
		$(".body").css('display','none'); 
	});
	
ipcRenderer.send('mesa');

});

function geramesa(){
	let nun = $("#n_mesas").val();
	if(nun != "" && nun < 50){
		let resultado = ipcRenderer.sendSync('gera_mesas', {"n_mesas":nun});
		if(resultado){
			$('.modal').modal('close');
			$("#editar").prop("checked", false);							
			M.toast({html: 'Mesas geradas com sucesso!'});
		}else{
			M.toast({html: "Erro ao gerar as Mesas!"});
		}
	}else{
		M.toast({html: "Digite o numero de mesas valido!"});
	}
};
			
function AbrePedido(mesa){
	if(editando == true){
		let resultado = ipcRenderer.sendSync('busca_pedido', {"mesa":mesa});
		if(mesa < 10){mesa = '0'+mesa;};
		$('#mesa').html("Mesa "+mesa);
		let html = '';
		let pedido = '';
		for(var i=0;i < resultado.length;i++){
			id = "'pedido"+resultado[i].id+"'";
			html += '<span id="'+resultado[i].id+'"><a onclick="AbreCorpoPedido('+id+')" class="btn btn_pedido waves-effect waves-light white-text"><strong>Pedido: </strong>'+resultado[i].id+'</a><a  class="btn_pedido_del btn red  dropdown-trigger" data-target="dropdown'+i+'"><i class="material-icons white-text">delete</i></a></span><ul id="dropdown'+i+'" class="dropdown-content"><li><a class="red white-text">NÂO</a></li><li class="divider"></li><li><a class="green white-text pedido_del" data="'+resultado[i].id+'" >SIM</a></li></ul>';
			pedido += '<div id="pedido'+resultado[i].id+'" class="corpo_pedido"><span class="card-title col s6">Comanda: '+resultado[i].comanda+'</span><span class="card-title col s6">Pedido: '+resultado[i].id+'</span><div class="col s12 corpo_tabela_pedido"><table class="centered striped responsive-table white"><thead class="azul white-text"><tr><th style="width:10%;">QUANTIDADE</th><th>ITEM</th></tr></thead><tbody>';
			let dados = JSON.parse(resultado[i].item);
			for(var y=0;y < dados.length;y++){
				pedido += "<tr><td>"+dados[y].qt+"</td><td>"+dados[y].pedidos+"</td></tr>";
			}
			pedido += '</tbody></table></div><div class="col s6 card">Usuário: '+resultado[i].usuario+'</div><div class="col s6 card">Hora: '+resultado[i].hora+'</div></div>';
		}
		pedido +='';
		$('#botoes_pedido').html(html);
		$('#corpo_pedido').html(pedido);
		$('#modal1').modal("open");
		$(".dropdown-trigger").dropdown();
		$(".pedido_del").click(function(){
			$("*").css("cursor", "wait");
			let resultado = ipcRenderer.sendSync('exclui_pedido', {pedido:$(this).attr("data"),mesa:mesa});
			if(resultado){
				$("*").css("cursor", "default");
				M.toast({html: "Pedido excluido com sucesso!"});
				$("#pedido"+$(this).attr("data")).remove();
				$("#"+$(this).attr("data")).remove();
				$(".corpo_pedido").first().css( "display", "block" );
				if($(".corpo_pedido").length == 0){
					$('#modal1').modal("close");
				}
			}else{
				M.toast({html: "Problemas ao executar o processo!"});
			}
		});
	}
};

function ExcluiMesa(dados){
	let mesa = dados;
	let resultado = ipcRenderer.sendSync('exclui_mesa', {"n_mesas":mesa});
	if(resultado.status){
		$('.modal').modal('close');
		$("#editar").prop("checked", false);
		$("#campo").removeClass("editando").addClass("campo");
		editando = true;
		M.toast({html: 'Mesa excluida!'});
		$("#modal2").modal("close");
	}else{
			M.toast({html: resultado.retorno});
	}
}

function AbreCorpoPedido(id){
	$('.corpo_pedido').css('display','none');
	$('#'+id).css('display','block');
}