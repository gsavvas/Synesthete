(function(){

	//make the disable button turn into a 're-enable' button if it's already disabled
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
		chrome.tabs.sendMessage(tabs[0].id,{method:"is_page_disabled"}, function(response){
			if(response === 'disabled')
				document.getElementById('disable_page_button').innerHTML = "re-enable for this page";
		});
	});
	chrome.extension.sendRequest({method:"get_temp_disable"}, function(response){
		if(response.disabled)
			document.getElementById('temp_disable_button').innerHTML = 'turn off temp disable';

	});

	document.getElementById("disable_page_button").onclick = function(){
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {	
			chrome.tabs.sendMessage(tabs[0].id,{method:'toggle_page' }, function(response) {
				show_reload_message();
			});
		});
	};

	document.getElementById("temp_disable_button").onclick = function(){
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {	
			chrome.tabs.sendMessage(tabs[0].id,{method:'toggle_global' }, function(response) {
				show_reload_message();
			});
		});
	};

	show_reload_message = function(){
		document.getElementById('content').innerHTML = "reload please";
	}

})();

