var data = new Date();
var a_ano_atual = [];
var a_ano_passado = [];
var ultima_semana = [];
var semana = [];

var meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
var dias = ["Domingo","Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sabado"];
var painel1 = document.getElementById("painel1").getContext('2d');
var painel2 = document.getElementById("painel2").getContext('2d');
var painel3 = document.getElementById("painel3").getContext('2d');

$(document).ready(function(){
$('.fixed-action-btn').floatingActionButton({
	 direction: 'left',
	 hoverEnabled: false
});
$('select').formSelect();
$('.modal').modal();
HTMLFieldSetElement.length

});

for(i = 1;i <= 12;i++){
	ano_atual = ipcRenderer.sendSync('busca_generica',"SELECT COUNT(id) as mes FROM pedido WHERE data BETWEEN ('"+data.getFullYear()+"-"+i+"-01') AND ('"+data.getFullYear()+"-"+(i+1)+"-01');");
	ano_passado = ipcRenderer.sendSync('busca_generica',"SELECT COUNT(id) as mes FROM pedido WHERE data BETWEEN ('"+(data.getFullYear()-1)+"-"+i+"-01') AND ('"+(data.getFullYear()-1)+"-"+(i+1)+"-01');");
	a_ano_atual.push(ano_atual[0].mes);
	a_ano_passado.push(ano_passado[0].mes);
}
for(i = 0;i <= 7;i++){
	let resultado = ipcRenderer.sendSync('busca_generica',"SELECT COUNT(id) as mes FROM pedido WHERE data = '"+data.getFullYear()+"-"+(data.getMonth()+1)+"-"+(data.getDate()-i)+"';");
	ultima_semana.push(resultado[0].mes);
	let dia = new Date('"'+data.getFullYear()+'/'+(data.getMonth()+1)+'/'+(data.getDate()-i));
	semana.push(dias[dia.getDay()]);
}

new Chart(painel1, {
	type: 'bar',
	data: {
		labels: meses,
		datasets: [{
			label: 'Ano Atual',
			data: a_ano_atual,
			backgroundColor: "#002951",
			borderColor: "white",
			borderWidth: 1
		},{
			label: 'Ano Anterior',
			backgroundColor: "red",
			borderColor: "blue",
			borderWidth: 1,
			data: a_ano_passado,
		}]	
	},
	options: {
		title: {
			display: true,
			text: 'Pedidos Realizados'
		}
	}
});

new Chart(painel2, {
	type: 'horizontalBar',
	data: {
		labels: semana,
		datasets: [{
			label: 'Pedidos',
			backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 180, 255, 0.2)',
				'rgba(255, 159, 64, 0.2)',
				'rgba(153, 102, 255, 0.2)'
            ],
			borderColor: "blue",
			borderWidth: 1,
			data: ultima_semana,
		}]	
	},
	options: {
		title: {
			display: true,
			text: 'Pedidos do Mês de '+ meses[data.getMonth()]
		}
	}
});
new Chart(painel3, {
	type: 'line',
	data: {
		labels: meses,
		datasets: [{
			label: 'Ano Atual',
			backgroundColor: "#002951",
			borderColor: "blue",
			borderWidth: 1,
			data: a_ano_atual,
		}]	
	},
	options: {
		title: {
			display: true,
			text: 'Pedidos do Ano Atual'
		}
	}
});

