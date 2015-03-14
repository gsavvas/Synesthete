(function(){

chrome.runtime.getBackgroundPage(function(bgPage){


	var list_el = document.getElementById('list'),
		add_button_el = document.getElementById('addButton'),
		colors;

	var remove = function(e){
		var id = e.target.id;
		var index = parseInt(id.slice(4));
		if(isFinite(index)){
			console.log(index);
			//var new_colors = JSON.parse(bgPage.localStorage.letBlocks).splice(index,1);
			colors.splice(index,1);
			bgPage.localStorage.letBlocks = JSON.stringify(colors); 
			refresh();
		}
	}


	add_button_el.onclick = function(){
		var character = document.getElementById('add_character').value;
		var color = document.getElementById('add_color').value;
		colors.push({str: character, clr:color});
		bgPage.localStorage.letBlocks = JSON.stringify(colors);
		refresh();
	};

	var refresh = function(){

		colors = JSON.parse(bgPage.localStorage.letBlocks);

		var str = "";
		colors.forEach(function(elm, index){
			str = str + "<li>"+elm.str+" : "+elm.clr+"<button id='btn_+"+index+"'> X </button></li>"
		});

		list_el.innerHTML = str;

		list_el.addEventListener("click", remove, false)
	}

	document.getElementById('resetButton').onclick = function(){
		var item = Array(5); 
		item[0] = {str: 'e', clr: '#800000'}; //maroon
		item[1] = {str: 'a',clr: '#008000'}; //green
		item[2] = {str: 'I', clr: '#0000ff'}; //blue
		item[3] = {str: 'O', clr:'#008080'}; //teal
		item[4] = {str:'U',clr: '#800080'}; //purple
		bgPage.localStorage.letBlocks = JSON.stringify(item);
		refresh();
	}

	refresh();

	


});


setColors = function(colors){
	chrome.runtime.getBackgroundPage(function(bgPage){
		console.log(bgPage.localStorage);
		bgPage.localStorage.letBlocks = JSON.stringify(colors); 
	});
};


  //localStorage["letBlocks"] = JSON.stringify(item);

/*
chrome.extension.sendRequest({method: "getColors"}, function(response) {

	refresh()
  
});

var refresh = function(){

	localStorage

};

*/
})();