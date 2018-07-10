var id;
var local;

function TamanhoMesa(){
var valorl= 10;
var valora= 8;
var mouse = false;
var delta=0;
var fonte=40;

function handle(delta) {
if (delta < 0){
	if(valora > 10){
		valora = valora-2;
		valorl = valorl-2;
		fonte = fonte-5;
	}
} else {
	if(valora < 20){
		valora = valora+2;
		valorl = valorl+2;
		fonte = fonte+5;
	}
}
$(".cbtn").each(function() {
		$(this).css("width",valora+"%");
		$(this).css("height",valorl+"%");
		$(this).css("font-size",fonte+"px");
});

}
$(".cbtn").hover(function(){
	if(!mouse){
		mouse = true;
	}else{
		mouse = false;
	}
})
function wheel(event){

if(event.wheelDelta){
	delta=event.wheelDelta/120;
}else if(event.detail){
	delta=-event.detail/3;
}if(delta && mouse && mouseblur)handle(delta);

event.returnValue=false;
}
window.addEventListener('DOMMouseScroll',wheel,false);
window.onmousewheel=document.onmousewheel=wheel;

};


  
  $('.btn').mousedown(function(e){ 
    if(e.button == 2) { 
		alert("teste");
    } 
  });
$( function() {
$(document).bind("contextmenu",function(e){
return false;
});

$("#editar").click(function(){
if( $("#editar").is(":checked") == true){
	mouseblur = true;
	editando = false;
	TamanhoMesa();
	$(".cbtn").draggable({
		containment: "#campo",
		cursor: "crosshair",
		grid: [ 2, 2 ]
		});
	$(".cbtn").css("cursor","crosshair");
	$("#campo").removeClass("campo").addClass("editando");
	$(".cbtn").mousedown(function(e){
		if(e.button == 2) { 
			$("#corpo_exclui").html("Deseja excluir a mesa <span id='id_mesa'>"+e.target.id+"</span> ?");
			id_mesa = "'"+e.target.id+"'";
			$("#modal2 .botoes").html('<a href="#!" class="modal-action modal-close waves-effect waves-green btn-large red">Não</a> <a onclick="ExcluiMesa('+id_mesa+');" class="waves-effect waves-ligth btn-large green">Sim</a>');
			$("#modal2").modal("open");
		} 
	});
}else{
	$( ".cbtn" ).draggable( "option", "disabled", true );
	$(".cbtn").css("cursor","pointer");
	mouseblur = false;
	editando = true;
	mouse = false;
	$("#campo").removeClass("editando").addClass("campo");
    local = [];
	i = 0;
	$(".cbtn").each(function() {
	local[i] = {"id": this.id, "local" : "width:"+$(this).width()+"px;height:"+$(this).height()+"px;top:"+$(this).css("top")+";left:"+$(this).css("left")+";font-size:"+$(this).css("font-size")};
	i++;
	});
	
	resultado = ipcRenderer.sendSync('salva_p_mesa', {local});
	if(resultado){
		M.toast({html: "Salvo com sucesso!"});
	}else{
		M.toast({html: "Erro ao Salvar!"});
	}
}
});	
});
