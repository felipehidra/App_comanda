$(document).ready(function() {
    $('select').material_select();
	atualizaclasse();
});
setInterval(function(){
	atualizaclasse();
},10000);
function atualizaclasse(){
	$.post('php/classes.php',function(resposta){
		$('#classes').html(resposta);
	});
}

function chamaclasse(classe){
	pedido = $('.itens').length+1;
	$.post('php/classe.php',{classe:classe,pedido:pedido},function(resposta){
		$('#pedido').append('<div class="itens" id="pedi'+pedido+'">'+resposta+'</div>');
	});
}

function remove() {
i = $('.itens').length;
$( "#pedi"+i+"" ).remove();
i--;
}
