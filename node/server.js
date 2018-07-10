var mysql = require('mysql')
var io = require('socket.io').listen(3000)
var md5 = require('md5');
var _ = require('lodash');
var fs = require('fs');  
var arquivo = "C:/Hidratech/conf.hidra";
var ip;
var usuario_banco;
var senha;
var database;
var retorno;
let resultado_login = "false";
var express = require("express");
var bodyParser = require("body-parser");
var app = express();

fs.readFile(arquivo, 'utf-8', function (err, data) {
	if(err){
    return console.log("Erro ao ler arquivo");
	}
	let Conf = JSON.parse(data);
	ip = Conf.ip_banco;
	usuario_banco = Conf.user;
	senha = Conf.senha;
	database = Conf.database;
	inicia_server();
});


// inicia o server depois de ler as configurações!
function inicia_server(){
var db = mysql.createConnection({
    host: ip,
    user: usuario_banco,
    password: senha,
    database: database
})
db.connect(function(err){
    if (err){
		console.log("Erro ao conectar ao banco de dados! - "+err.stack);
	}else{
		console.log("Nucleo conectado ao banco de dados!");
	}
})

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(__dirname + '/'));

app.get('/', function(req, res){
  var uid = req.params.uid
    , file = req.params.file;

  req.user.mayViewFilesFrom(uid, function(yes){
    if (yes) {
      res.sendFile('/aplicativo' + uid + '/' + file);
    } else {
      res.status(403).send("Erro ao abrir o arquivo HTML.");
    }
  });
});

app.post('/login',function(req,res){
res.setHeader("Access-Control-Allow-Origin", "*");
let login = req.body.login;
let senha = req.body.senha;
let app = req.body.app;
db.query("SELECT id FROM login WHERE login = '"+login+"' AND senha is null;", function(err, linhas) {
	retorno = linhas.length;
}).on("end",function(){
	if(retorno > 0){
		resultado_login =  {"status":"senha"};
		resultado_login = JSON.stringify(resultado_login);
		res.end(resultado_login);	
	}else{
   			db.query("SELECT usuario.*, acesso.*, acesso."+app+" as acesso FROM login INNER JOIN acesso ON acesso.id = login.acesso INNER JOIN usuario ON usuario.id = login.usuario WHERE login = '"+login+"' AND senha = '"+md5(senha)+"';", function(err, linhas) {
					if (err){
						res.end('false')
					}else{
						retorno = linhas;
					}
				}).on('end',function(){
					if(retorno.length > 0){
						if(retorno[0].acesso == 1){
							resultado_login = {"status":"true","dados":retorno};			
						}else{
							resultado_login = {"status":"acesso"};
						}
					}else{
						resultado_login =  {"status":"false"};
					}
					resultado_login = JSON.stringify(resultado_login);
					res.end(resultado_login);
			});
		}
	});
});
app.listen(4000,function(){
  console.log("Aplicativos iniciados na porta 4000");
})

var retorno = 0;
var mesas = []
var classes = [];
var inicio = true
var usuario = [];
var pedido = [];

io.sockets.on('connection', function(socket){
	
	socket.on('usuario',function(nome){
		usuario = nome;
		console.log('Cliente '+usuario+' chegou!');
	});
	
	console.log('Cliente '+usuario+' Conectado');
	
    socket.on('disconnect', function() {
     console.log('Cliente Desconectado');
    })
	socket.on('reconnect', function() {
	console.log('Cliente Reconectado');
	});
	
	socket.on('mesa', function(){
		socket.emit('mesas', mesas);
    })
	
	socket.on('gera_mesas', function(data,callback){
		db.query("TRUNCATE TABLE mesa;", function(err) {if (err) throw err;});
		for(var i = 0;i < data.n_mesas;i++){
			if( i < mesas.length && mesas[i].status){
				db.query("INSERT INTO mesa (status) VALUES ('1')", function(err) {if (err) throw err;});
			}else{
				db.query("INSERT INTO mesa (status) VALUES ('0')", function(err) {if (err) throw err;});
			}
		}	
		mesas = []; 
		db.query('SELECT * FROM mesa')
            .on('result', function(data){
                mesas.push(data);
            })
            .on('end', function(){
                socket.emit('mesas', mesas);
            })
		return callback(true);
    })
	
	socket.on('exclui_mesa', function(data,callback){
		let verificar = _.filter(mesas, { 'mesa': data.n_mesas, 'status': true});
		console.log()
		if(verificar.length == 0){
			db.query("DELETE FROM mesa WHERE mesa = '"+data.n_mesas+"';", function(err) {if (err) throw err;
				return callback({"status": true});
			});
			console.log(data.n_mesas);
			mesas.splice(_.findIndex(mesas, {mesa: data.n_mesas}), 1);
			console.log(mesas);
			socket.emit('mesas', mesas);
		}else{
			return callback({"status": false,"retorno":"Mesa possui Pedido!"});	
		}
    })
	
	socket.on('salva_p_mesa', function(data,callback){
		for(var i = 0;i < data.local.length;i++){
		db.query("UPDATE mesa set local = '"+data.local[i].local+"' WHERE mesa = '"+data.local[i].id+"';", function(err) {if (err) throw err;});
		mesas[i].local = data.local[i].local;			
		}
		socket.emit('mesas', mesas);
		return callback(true);
    })
	
	socket.on('importa_arquivo', function(data,callback){
		data = data.toString().split("\r\n");
		for(i = 0;i < data.length;i++){
			data[i] = data[i].split(";");
		}
		
		if(data[0].length != 3){return callback(false);}
	
		var id_ultimo_item = 0;
		db.query("SELECT * FROM `item` ORDER BY id DESC LIMIT 1;").on('result', function(data){
			id_ultimo_item = data.id;
		}).on('end', function(){
			console.log(id_ultimo_item);
			if(id_ultimo_item == undefined){id_ultimo_item = 0;}
			for(i = 0;i < data.length;i++){
				id_ultimo_item++;
				if(data[i][0] != ""){
				db.query("INSERT INTO item (classe,item,valor,estado,data) values ('"+data[i][0]+"','"+data[i][1]+"','"+data[i][2]+"','1',now());", function(err) {if (err) throw err;});
				classes.push({id: id_ultimo_item,classe: data[i][0],item: data[i][1],valor: data[i][2],estado: 1,});
				}
			}
			socket.broadcast.emit('classes', classes);
			return callback(true);
		});
    })
	socket.on('classes', function(){
		socket.emit('classes', classes);
    })
	
	socket.on('classes_main', function(data,callback){
		 return callback(classes);
	})
	
	socket.on('salva_usuario', function(data,callback){	
	   let sql_1 = "";
	   let sql_2 = "";
	   let resultado;
	   var id_acesso;
	   var id_cadastro;
	   let acesso = data.acessos;
		for(var i =0;i< acesso.length;i++){
			if(i < (acesso.length-1)){
				sql_1 += acesso[i]+",";
				sql_2 += "'1',";
			}else{
				sql_1 += acesso[i];
				sql_2 += "'1'";
			}
		   
		}
		if(data.update){
			console.log(data.id)
			sql_1 = sql_1.split(",");
			sql_2 = sql_2.split(",");
			db.query("SELECT acesso,usuario FROM login WHERE id = '" +data.id + "';").on('result', function(data){
				resultado = data;
			}).on("end",function(){
				db.query("UPDATE acesso SET app1 = null,app2= null,app3= null,acesso1= null,acesso2 = null,acesso3 = null,acesso4 = null,acesso5 = null,acesso6 = null WHERE id = '"+resultado.acesso+"';").on('end', function(){
					for(i=0;i< acesso.length;i++){
						db.query("UPDATE acesso SET "+sql_1[i]+" = "+sql_2[i]+" WHERE id = "+resultado.acesso+";");
					}
				}).on("end",function(){
					db.query("UPDATE usuario SET nome = '"+data.nome+"',setor = '"+data.setor+"',foto = '"+data.imagem+"';");
				}).on('end',function(){
					return callback({status:true,mensagem:"Cadastro alterado com sucesso!"});
				})
			})
		}else{
		db.query("SELECT COUNT(id) FROM login WHERE login = '"+data.login+"';").on('result', function(data){
			resultado = data;
		}).on("end",function(){
			resultado = resultado[Object.keys(resultado)[0]];
				if(resultado == 0){
					db.query("INSERT INTO acesso ("+sql_1+") VALUES ("+sql_2+");").on('end', function(){
						db.query("SELECT id FROM acesso order by id DESC limit 1;").on('result', function(data){
							id_acesso = data;
						}).on("end",function(){
							db.query("INSERT INTO usuario (nome,setor,foto) VALUES ('"+data.nome+"','"+data.setor+"','"+data.imagem+"');").on('end', function(){
								db.query("SELECT id FROM usuario order by id DESC limit 1;").on('result', function(data){
									id_cadastro = data;
								}).on("end",function(){
									db.query("INSERT INTO login (login,acesso,usuario,ativo,data) VALUES ('"+data.login+"','"+id_acesso.id+"','"+id_cadastro.id+"','0',now());").on('end', function(){
										return callback({status:true,mensagem:"Usuário criado com Sucesso!"});
									})
								});
							});
						});
					});
				}else{
					return callback({status:false,mensagem:"Login já foi utilizado. Escolha outro!"});
				}
		});
	}
	});
	
	socket.on('excluir_usuario', function(data,callback){
		let usuario = [];
		console.log(data);
		db.query("SELECT * FROM login WHERE id = '"+data+"';").on('result',function(data){
			usuario.push(data);
		}).on('end',function(){
			console.log(usuario);
			db.query("DELETE FROM acesso WHERE id = '"+usuario[0].acesso+"';").on('end',function(){
				db.query("DELETE FROM usuario WHERE id = '"+usuario[0].usuario+"';").on('end',function(){
					db.query("DELETE FROM login WHERE id = '"+data+"';").on('end',function(){
						return callback(true);
					});
				});
			});
		}).on('err',function(){
			return callback(false);
		});
    });
	
    socket.on('pedido', function(data,callback){
		console.log(data.usuario);
		if(data.mesa < 10){data.mesa = '0'+data.mesa;}
		for(i = 0;i < mesas.length;i++){
			if(mesas[i].mesa == data.mesa){
				mesas[i].status = 1;			
			}
		}
		socket.broadcast.emit('mesas', mesas);
		db.query("UPDATE mesa SET status = '"+1+"'  where mesa = ?", data.mesa);
		db.query("INSERT INTO pedido (comanda,mesa,item,observacao,usuario,hora,data,status) values ('"+data.comanda+"','"+data.mesa+"','"+data.pedido+"','"+data.obs+"','"+data.usuario+"',now(),now(),'1');").on("end",function(){
			db.query("SELECT * FROM pedido WHERE status = '1' ORDER BY id DESC LIMIT 1;").on('result', function(data){
				pedido.push(data);
			}).on('end', function(){
				socket.broadcast.emit('painel', pedido);
				return callback(true);
			})
		});
	});
	
	socket.on('entregar_pedido', function(data,callback){
		pedido = _.reject(pedido, {id:data});
		socket.broadcast.emit('painel', pedido);
		db.query("UPDATE pedido SET status = '0' WHERE id = '"+data+"';").on("end",function(){
			return callback(true);
		});
    });
	
	socket.on('busca_pedido', function(data,callback){
		 let dados = [];
		 db.query("SELECT * FROM pedido WHERE mesa = '"+data.mesa+"' AND status = '1';")
            .on('result', function(data){
				dados.push(data);
			}).on('end', function(){
               return callback(dados);
            });
	});
	
	socket.on('exclui_pedido', function(data,callback){
		let dados = [];
		db.query("UPDATE pedido SET status = '0' WHERE id = '"+data.pedido+"';").on('end', function(){
				db.query("SELECT id FROM pedido WHERE mesa = '"+data.mesa+"' AND status = '1';").on('result', function(data){
					dados.push(data);
				}).on('end',function(){
					console.log(dados.length);
					if(dados.length == 0){
						db.query("UPDATE mesa SET status = '0' WHERE mesa = '"+data.mesa+"';");
						for(i = 0;i < mesas.length;i++){
							if(mesas[i].mesa == data.mesa){
								mesas[i].status = 0;			
							}
						}
						socket.broadcast.emit('mesas', mesas);
					}
					return callback(true);
				});
		   });
   	});
	
	socket.on('comanda', function(data,callback){
		let resultado = "";
		console.log(data.novo);
		if(!data.novo){
			db.query("SELECT COUNT(id) FROM comanda WHERE comanda = '"+data.comanda+"';").on('result', function(data){
				resultado = data;
			}).on('end', function(){
				resultado = resultado[Object.keys(resultado)[0]];
				if(resultado != 0){
					return callback({status: false,msg:"Comanda já cadastrada!"});	
				}else{
					db.query("INSERT INTO comanda (comanda,cadastro,data,usuario) values ('"+data.comanda+"','"+data.id+"',now(),'"+data.usuario+"');").on("end",function(){
						return callback({status: true});
					});	
				}
			});
		}else{
		db.query("SELECT COUNT(id) FROM cadastro WHERE fone = '"+data.numero+"' or nome = '"+data.nome+"'").on('result', function(data){
				resultado = data;
			}).on('end', function(){
				resultado = resultado[Object.keys(resultado)[0]];
				if(resultado != 0){
					return callback({status: false,msg:"Nome ou numero já cadastrado!"});	
				}else{
					resultado = '';
					db.query("SELECT COUNT(id) FROM comanda WHERE comanda = '"+data.comanda+"';").on('result', function(data){
						resultado = data;
					}).on('end', function(){
						resultado = resultado[Object.keys(resultado)[0]];
						if(resultado != 0){
							return callback({status: false,msg:"Comanda já cadastrada!"});	
						}else{
							db.query("INSERT INTO cadastro (nome,dependente,fone,email,data) values ('"+data.nome+"','"+data.dependentes+"','"+data.numero+"','"+data.email+"',now());").on('end',function(){
								db.query("SELECT id FROM cadastro ORDER BY id DESC LIMIT 1;").on('result', function(data){
									resultado = data.id;
									console.log(data.id);
								}).on('end', function(){
									db.query("INSERT INTO comanda (comanda,cadastro,data,usuario) values ('"+data.comanda+"','"+resultado+"',now(),'"+data.usuario+"');");
									return callback({status: true});
								});
							});
						}
					});
				}
			});
		}
    });
	
	socket.on('item_ativo', function(data,callback){
		 let resultado;
		 console.log(data.estado);
		 db.query("UPDATE item SET estado = "+data.estado+" WHERE id = '"+data.id+"';")
            .on('result', function(data){
				resultado = data.affectedRows;
			}).on('end', function(){
				if(resultado > 0){
					let id = classes.findIndex(function (e){return e.id == data.id;});
					console.log(id);
					classes[id].estado = data.estado;
					socket.broadcast.emit('classes', classes);
					return callback(true);
				}else{
					return callback(false);
				}
            });
    });
	
	socket.on('deleta_item', function(data,callback){
		 let resultado;
		 db.query("DELETE FROM item WHERE id = '"+data.id+"';")
            .on('result', function(data){
				resultado = data.affectedRows;
			}).on('end', function(){
				if(resultado > 0){
					let id = classes.findIndex(function (e){return e.id == data.id;});
					classes.splice(id, 1);
					socket.broadcast.emit('classes', classes);
					return callback(true);
				}else{
					return callback(false);
				}
            });
    });
	
	socket.on('limpa_classe', function(data,callback){
		let resultado = [];
		db.query("SELECT DISTINCT classe FROM item;").on('result', function(data){
			resultado.push(data.classe);
		}).on('end', function(){
			console.log("LIMPA = "+resultado.length);
			if(resultado.length == 1){
				db.query("TRUNCATE TABLE item;").on('end', function(){
					classes = [];
					socket.broadcast.emit('classes', classes);
					return callback(true);
				});
			}else{
				db.query("DELETE FROM item WHERE classe = '"+data+"';").on('result', function(data){
					resultado = data.affectedRows;
				}).on('end', function(){
					if(resultado > 0){
						classes =_.reject(classes, {classe:data});
						socket.broadcast.emit('classes', classes);
						return callback(true);
					}else{
						return callback(false);
					}
				});
			}
		});		
    });
	
	socket.on('busca_cadastro', function(data,callback){
		let resultado = '';
		let dados = [];
        db.query("SELECT * FROM cadastro WHERE nome LIKE '%"+data.nome+"%';")
            .on('result', function(data){
				resultado = data.length;
				dados.push(data);
			}).on('end', function(){
                if(resultado != 0){
					return callback({status:true,dados:dados});
				}else{
					return callback({"status":false});
				}
            });
    });
	
	socket.on('busca_nome', function(data,callback){
		let resultado = '';
		let nome = '';
		console.log(data.comanda);
        db.query("SELECT nome FROM cadastro inner join comanda on cadastro.id = comanda.cadastro where comanda.comanda = '"+data.comanda+"';")
            .on('result', function(data){
				resultado = data.length;
				nome = data.nome;
			}).on('end', function(){
				console.log(resultado);
				console.log(nome);
                if(resultado == 0){
					return callback({"status":false});
				}else{
					return callback({"status":true,"nome":nome});
				}
            });
    });
	
	socket.on('p_senha', function(data,callback){
		let resultado;	
        db.query("UPDATE login SET senha ='"+md5(data.senha)+"' WHERE login ='"+data.login+"';").on('result', function(data){
				resultado = data.affectedRows;
			}).on('end', function(){
				return callback(resultado);
            });
	});


	socket.on('busca_generica', function(data,callback){
		let resultado = [];	
		//console.log(data)
        db.query(data).on('result', function(data){
				resultado.push(data);
			}).on('end', function(){
				//console.log(resultado);
				return callback(resultado);
            });
	});
	
    if (inicio) {
        db.query('SELECT * FROM mesa').on('result', function(data){
                mesas.push(data);
            }).on('end', function(){
                socket.emit('mesas', mesas);
            })
		db.query('SELECT * FROM item order by classe asc').on('result', function(data){
			classes.push(data);
			}).on('end', function(){
                socket.emit('classes', classes);
			})
		db.query("SELECT * FROM pedido WHERE status = '1' ORDER BY id;").on('result', function(data){
				pedido.push(data);
			}).on('end', function(){
				socket.emit('painel', pedido);
			})
 
        inicio = false;
    } else {
		socket.emit('painel', pedido);
        socket.emit('mesas', mesas);
		socket.emit('classes', classes);
    }
})
console.log('###############################################################\n Nucleo Online!\n###############################################################');
}