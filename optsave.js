(function(){


	var list_el = document.getElementById('list'),
		add_button_el = document.getElementById('addButton'),
		colors,
		domains,
		domain_list_el = document.getElementById('domainList'),
		add_domain_el = document.getElementById('addDomain');

	var remove = function(e){
		var id = e.target.id;
		console.log(e.target.id);
		if(id.includes("domain")){ //domain
			var index = parseInt(id.slice(11));
			if(isFinite(index)){
				domains.splice(index,1);
				chrome.storage.local.set({'blockedDomains': JSON.stringify(domains)});
				refresh();
			}
		}
		else{ //color
			var index = parseInt(id.slice(4));
			if(isFinite(index)){
				colors.splice(index,1);
				chrome.storage.local.set({'letBlocks': JSON.stringify(colors)}); 
				refresh();
			}
		}
	};


	add_button_el.onclick = function(){
		var character = document.getElementById('add_character').value;
		var color = document.getElementById('add_color').value;
		colors.push({str: character, clr:color});
		chrome.storage.local.set({'letBlocks': JSON.stringify(colors)});
		refresh();
	};
	
	add_domain_el.onclick = function(){
		var newDomain = document.getElementById('add_site').value;
		domains.push(newDomain);
		chrome.storage.local.set({'blockedDomains': JSON.stringify(domains)});
		refresh();
	};
	

	var refresh = function(){


		chrome.storage.local.get(["letBlocks","blockedDomains"]).then((result) => {
			colors = JSON.parse(result.letBlocks);
			//console.log(colors);
			var str = "";
			colors.forEach(function(elm, index){
				str = str + "<li><span style='color:" + elm.clr + ";'>" + elm.str + " : " + elm.clr + "</span><button id='btn_" + index + "'> X </button></li>";
			});
			
			list_el.innerHTML = str;
			
			list_el.addEventListener("click", remove, false);
			
			domains = JSON.parse(result.blockedDomains);
			str = "";
			domains.forEach(function(elm, index){
				str = str + "<li>" + elm + " <button id='btn_domain_" + index + "'> X </button></li>"
				
			});
			domain_list_el.innerHTML = str;
			domain_list_el.addEventListener("click",remove,false);
			
		});
		
		
		
		


	}

	document.getElementById('resetButton').onclick = function(){
		var item = Array(5); 
		item[0] = {str: 'e', clr: '#800000'}; //maroon
		item[1] = {str: 'a',clr: '#008000'}; //green
		item[2] = {str: 'I', clr: '#0000ff'}; //blue
		item[3] = {str: 'O', clr:'#008080'}; //teal
		item[4] = {str:'U',clr: '#800080'}; //purple

		chrome.storage.local.set({'letBlocks': JSON.stringify(item)});
		
		let base_domains = ["example.com","dogs.com"];
        chrome.storage.local.set({"blockedDomains": JSON.stringify(base_domains)});
		
		refresh();
	}

	refresh();



setColors = function(colors){

	chrome.storage.local.set({'letBlocks':JSON.stringify(colors)});
};


})();