function chama(){
	$.post('php/chama.php', function(resposta) {
		if(resposta != ""){
			if(getCookie("chama") == "true"){
			$(".modal-content").html(resposta);
			$('#modal1').modal('open');
			}
		}else{
		$('#modal1').modal('close');
		}
		setTimeout('chama()',5000);
  });
}

function atender() { 
	nome = getCookie("login");
	mesa = $("#mesa_chama").val();
	$.post('php/atende.php', {nome: nome, mesa: mesa}, function(resposta) {
		 Materialize.toast(resposta, 4000);		
	});
}

function Nao_atender() { 
document.cookie = "chama=false"; 
}