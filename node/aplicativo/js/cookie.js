
function setCookie(cname, cvalue) {
    document.cookie = cname+"="+cvalue+";";
}


function getCookie(cname) {
    var nome = cname;
	var cookies = document.cookie.split(';');
	let resultado = '';
    for(var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].split('=');
		cookie[0] = cookie[0].replace(/^\s+|\s+$/g,"");;
		if(cookie[0] == nome){
			resultado = cookie[1];
		}
    }
    return resultado;
}