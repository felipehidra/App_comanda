var tabela = [];
$(document).ready(function(){
$('.modal').modal();
$('.fixed-action-btn').floatingActionButton({
	 direction: 'left',
	 hoverEnabled: false
});
inicia_classes();

$("#btn_limpar_classe").click(function(){
	let classe = $("#classes option:selected").text();
	$("#limpar_classe #corpo_exclui_classe").html("Deseja realmente excluir a classe "+classe+"?");
	$("#limpar_classe").modal("open");
});

$("#excluir_classe").click(function(){
	let classe = $("#classes option:selected").text();
	let resultado = ipcRenderer.sendSync('limpa_classe',classe.toLowerCase());
		if(resultado){
			M.toast({html: 'Classe excluida com sucesso!'});
			inicia_classes();
		}else{
			M.toast({html: 'Problemas ao excluir a Classe!'})
		}
	$("#limpar_classe").modal("close");
});

$('#importar').click(function (){
	var $this = $(this);
	$this.button('loading');
		var reader = new FileReader();
			reader.onload = function (e) {
				let arquivo = e.target.result;
				resultado = ipcRenderer.sendSync('importa_arquivo',arquivo);
				if(resultado){
					M.toast({html: 'Arquivo importado com sucesso!'});
				}else{
					M.toast({html: 'Problemas ao importar o arquivo! verifiquei a formatação.'})
				}
				$this.button('reset');
				inicia_classes();	 
				$('#nova_classe').modal('close');
			}
		reader.readAsText($("#arquivo")[0].files[0]);
});
$("#excluir").click(function(){
		let id = $("#id_item").html();
		resultado = ipcRenderer.sendSync('deleta_item',{id: id});
		if(resultado){
			M.toast({html: 'Item Excluido!'});
			$('#alerta_delta_item').modal('close');
			inicia_classes();
		}else{
			M.toast({html: 'Problemas ao excluir o Item!'})
		}
	});
});
function seletores_classe(){
	$('#classes').change(function(){
		let id = this.value;
		$('#tabela_estoque').html(tabela[id]);
		$('#tabela_estoque').append('<script src="js/ordenar.js"></script>');
		verifica_ativo();
	})
}

function inicia_classes(){
var classes = ipcRenderer.sendSync('classes');
var html = '';
let ativo = '';
if(classes == ""){
$('#tabela_estoque').html("<h4>Não existem itens cadastrados!</h4><h5>Realize uma importação!</h5>");	
}else{  
var classe = [...new Set(classes.map(item => item.classe))];
	for(var i = 0; i < classe.length; i++){
		tabela[i] = '<h4>'+classe[i].toUpperCase()+'</h4><table class="striped highlight responsive-table centered sortable"><thead><tr class="azul white-text"><th>ID</th><th>Classe</th><th>Produto</th><th>Valor</th><th>Status</th><th></th></tr></thead><tbody>';
		html += '<option value="'+i+'" class="btclasses">'+ classe[i].toUpperCase()+'</option>';
		for(var y = 0; y < classes.length; y++){
			ativo = '';
			if(classes[y].estado == 1){ativo = 'checked="checked"';}
			if(classes[y].classe == classe[i]){
			tabela[i] += '<tr><td>'+("0000" + classes[y].id).slice(-4)+'</td><td>'+classes[y].classe+'</td><td nowrap="nowrap">'+classes[y].item+'</td><td>R$ '+classes[y].valor+'</td><td><p><label><input type="checkbox" id="'+classes[y].id+'" class="filled-in" '+ativo+' /><span></span></label></p></td><td><i class="material-icons deleta red-text" data="'+classes[y].id+'">delete</i></td></tr>';
			}
		}
		tabela[i] += "</tbody></table>";
	}
$('#classes').html(html);
$('#tabela_estoque').append('<script src="js/ordenar.js"></script>');
$('select').formSelect();
seletores_classe();
$('#tabela_estoque').html(tabela[0]);
verifica_ativo();
}
}

function verifica_ativo(){
	let ativo;
	let resultado;
	$('.filled-in').click(function(e){
		ativo = $(this).is(":checked");
		resultado = ipcRenderer.sendSync('item_ativo',{id: e.target.id, estado: ativo});
		if(resultado){
			 if(ativo){
				 M.toast({html: 'Item Visivel!'})
			 }else{
				 M.toast({html: 'Item Invisivel!'})
			 }
		}else{
			 alert("Erro ao processar! Reinicie a aplicação!");
		}
	});
	$('.deleta').click(function(){
			let id = $(this).attr('data');
			$('#corpo_exclui').html("Deseja realmente excluir o item <span id='id_item'>"+id+"</span>?");
			$('#alerta_delta_item').modal('open');
	});
}