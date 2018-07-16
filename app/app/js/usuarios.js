var resultado ;
$(document).ready(function(){
var resize = new window.resize();
resize.init();

// apresenta os usuários na tela
usuarios();
$('.modal').modal();
$('.fixed-action-btn').floatingActionButton({
     direction: 'left',
     hoverEnabled: false
});
$('select').formSelect();

$(".abre_modal").click(function(){
    $(".filled-in").each(function(){
        $(this).attr("checked", false);
    });
    $('#Tela').attr('src',"imagem/usu.png");
    $("#novo_cadastro .barra").html("Novo Cadastro");
    $(".input-field input").val('');
    $(".input-field label").removeClass("active");
    $("#salvar_cadastro").data('update',false);
    $("#novo_cadastro .container .texto_inicial").html("Insira os dados a seguir para cadastrar um novo usuário!")
    $("#"+$(this).data('modal')).modal("open"); 
});
$(".resetar_senha").click(function(){
    let id = $(this).attr("data");
    $("#alerta_geral .container").html("<h5>Deseja realmente resetar a senha do usuário <span class='id_usu'></span>!</h5>");
    $("#alerta_geral .barra_alerta").html("<i class='material-icons'>vpn_key</i> Usuário <span class='id_usu'></span>");
    $("#alerta_geral .rodape_alerta").html('<button class="btn btn-large waves-effect waves-light red modal-close">Não</button><button data="'+id+'" id="salvar_senha" class="btn btn-large waves-effect waves-light green" data-loading-text="Processando...">Sim</button>');
    $(".id_usu").html(id);
    $("#alerta_geral").modal("open");
    botoes();
});
$(".excluir_usuario").click(function(){
    let id = $(this).attr("data");
    $("#alerta_geral .container").html("<h5>Deseja realmente excluir o usuário <span class='id_usu'></span>!</h5>");
    $("#alerta_geral .barra_alerta").html("<i class='material-icons'>delete</i> Usuário <span class='id_usu'></span>");
    $("#alerta_geral .rodape_alerta").html('<button class="btn btn-large waves-effect waves-light red modal-close">Não</button><button data="'+id+'" id="excluir_usuario" class="btn btn-large waves-effect waves-light green" data-loading-text="Processando...">Sim</button>');
    $(".id_usu").html(id);
    $("#alerta_geral").modal("open");
    botoes();
});
$(".editar_usuario").click(function(){
    let id = $(this).attr("data");
    let id_obj = $(this).data('object');
    $('#Tela').attr('src',resultado[id_obj].foto);
    $("#login").val(resultado[id_obj].login);
    $("#nome").val(resultado[id_obj].nome);

    $(".input-field label").addClass("active");
    
    $("#novo_cadastro").modal("open");
    $("#novo_cadastro .barra").html("Editar Cadastro");
    $("#salvar_cadastro").data('update',true);
    $("#salvar_cadastro").data('usu_id',id);
});

$( "#foto" ).change(function() {
    var imagens;
    imagens = $('#foto')[0].files;
    console.log(imagens[0].src)
    resize.photo(imagens[0], 100, 'dataURL', function (imagem) {
        $('#Tela').attr('src',imagem);
    });
});

$('#salvar_cadastro').click(function(){
    let acessos = [];
    let imagem = $('#Tela').attr('src');
    let login = $('#login').val();
    let nome = $('#nome').val();
    let setor = $('#setor').val();
    let dados = {update:false,login:login,nome: nome,setor:setor,acessos:acessos,imagem:imagem};
    if($(this).data('update')){
        dados = {update:true,id:$(this).data('usu_id'),login:login,nome: nome,setor:setor,acessos:acessos,imagem:imagem};
    }
        let i = 0;
        $(".filled-in").each(function(){
            if($(this).is(":checked")){
                acessos[i] = this.id;
            i++;
            }
        });
        if(nome != "" && login != "" && acessos.length !=0){
            let resultado = ipcRenderer.sendSync('salva_usuario',dados);
            if(resultado.status){
                M.toast({html: resultado.mensagem});
                $("#novo_cadastro").modal("close");
                usuarios();
            }else{
                M.toast({html: resultado.mensagem});
            }
        }else{
            M.toast({html: "<i class='material-icons'>info</i> Insira todos os dados!"});
        }
})

$('.chip').click(function(){
    if($( this ).prop('class').split(' ').pop() != "chip_ativo"){
        $(this).removeClass('grey lighten-2');
        $(this).addClass('green lighten-1 white-text');
        $(this).addClass('chip_ativo');
    }else{
        $(this).removeClass('chip_ativo');
        $(this).removeClass('green lighten-1 white-text');
        $(this).addClass('grey lighten-2');
    }
});
});
function usuarios(){
    resultado = ipcRenderer.sendSync('busca_generica',"SELECT login.id as id_usu,login.login,acesso.*,usuario.* FROM login INNER JOIN usuario ON usuario.id = login.usuario JOIN acesso ON acesso.id = login.acesso;");
    var html = "";
    if(resultado.length == 0){
        $("#campo_usu").html("<h4>Você ainda não possui usuários cadastrados!</h4>");   
    }else{
        for(i = 0;i < resultado.length;i++){
            if(resultado[i].setor == 1){setor_usu = "Administração"}else if(resultado[i].setor == 2){ setor_usu = "CAIXA"}else if(resultado[i].setor == 3){setor_usu = "GARÇOM"}
            html += '<div class="card card_usu col"><div class="barra azul white-text">Usuário '+resultado[i].id_usu+'</div><div class="grey"><div class="card-image container"><img src="'+resultado[i].foto+'"></div></div><i class="material-icons activator white-text right">more_vert</i>';
            html += '<div class="card-content azul white-text"><p><strong>Login: </strong>'+resultado[i].login+'</p><strong>'+setor_usu+'</strong></div>'
            html += '<div class="card-reveal"><span class="card-title"><i class="material-icons right">close</i><br><button data="'+resultado[i].id+'" class="row btn waves-effect waves-light resetar_senha" title="Redefinir a senha!"><i class="material-icons">vpn_key</i></button><br><button data="'+resultado[i].id+'" class="row btn waves-effect waves-light excluir_usuario red" title="Excluir usuário!"><i class="material-icons">delete</i></button><br><button data-object="'+i+'" data="'+resultado[i].id+'" class="row btn waves-effect waves-light editar_usuario green" title="Editar usuário!"><i class="material-icons">edit</i></button></div></div>';
        }
        $("#campo_usu").html(html);
        $('.chips').chips();
        botoes_usu();
    }
}

function botoes_usu(){
    $(".resetar_senha").click(function(){
        let id = $(this).attr("data");
        $("#alerta_geral .container").html("<h5>Deseja realmente resetar a senha do usuário <span class='id_usu'></span>!</h5>");
        $("#alerta_geral .rodape_alerta").html('<button class="btn btn-large waves-effect waves-light red modal-close">Não</button><button data="'+id+'" id="salvar_senha" class="btn btn-large waves-effect waves-light green" data-loading-text="Processando...">Sim</button>');
        $(".id_usu").html(id);
        $("#alerta_geral").modal("open");
        botoes();
    });
    $(".excluir_usuario").click(function(){
        let id = $(this).attr("data");
        $("#alerta_geral .container").html("<h5>Deseja realmente excluir o usuário <span class='id_usu'></span>!</h5>");
        $("#alerta_geral .rodape_alerta").html('<button class="btn btn-large waves-effect waves-light red modal-close">Não</button><button data="'+id+'" id="excluir_usuario" class="btn btn-large waves-effect waves-light green" data-loading-text="Processando...">Sim</button>');
        $(".id_usu").html(id);
        $("#alerta_geral").modal("open");
        botoes();
    });
    $(".editar_usuario").click(function(){
        let id = $(this).attr("data");
        let id_obj = $(this).data('object');
        $("#Tela").attr("src",resultado[id_obj].foto);
        $("#login").val(resultado[id_obj].login);
        $("#nome").val(resultado[id_obj].nome);
        $("#setor").val(resultado[id_obj].setor);
        $("#novo_cadastro .container .texto_inicial").html("Insira os dados a seguir para modificar o usuário "+resultado[id_obj].login+"!")

        if(resultado[id_obj].app1 == 1){$("#app1").attr("checked", true);}
        if(resultado[id_obj].app2 == 1){$("#app2").attr("checked", true);}
        if(resultado[id_obj].app3 == 1){$("#app3").attr("checked", true);}
        if(resultado[id_obj].acesso1 == 1){$("#acesso1").attr("checked", true);}
        if(resultado[id_obj].acesso2 == 1){$("#acesso2").attr("checked", true);}
        if(resultado[id_obj].acesso3 == 1){$("#acesso3").attr("checked", true);}
        if(resultado[id_obj].acesso4 == 1){$("#acesso4").attr("checked", true);}
        if(resultado[id_obj].acesso5 == 1){$("#acesso5").attr("checked", true);}
        if(resultado[id_obj].acesso6 == 1){$("#acesso6").attr("checked", true);}
        
        $(".input-field label").addClass("active");
        
        $("#novo_cadastro").modal("open");
        $("#novo_cadastro .barra").html("Editar Cadastro");
        $("#salvar_cadastro").data('update',true);
        $("#salvar_cadastro").data('usu_id',id);
        $('select').material_select();
    });
}

function botoes(){
$("#salvar_senha").click(function(){
    let id = $(this).attr("data");
    resultado = ipcRenderer.sendSync('busca_generica',"UPDATE login SET senha = null WHERE id = '"+id+"';");
    $("#alerta_geral").modal("close");
    if(resultado[0].affectedRows == 1){
        M.toast({html: "Senha redefinida com sucesso!"});
    }else{
        M.toast({html: "Erro ao realizar o processo!"});
    }
});

$("#excluir_usuario").click(function(){
    let id = $(this).attr("data");
    let resultado = ipcRenderer.sendSync('excluir_usuario',id);
    $("#alerta_geral").modal("close");
    if(resultado){
        usuarios();
        M.toast({html: "Usuário excluido com sucesso!"});
    }else{
        M.toast({html: "Erro ao realizar o processo!"});
    }
});
}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        

