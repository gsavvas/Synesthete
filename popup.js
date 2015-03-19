(function(){

	document.getElementById("disable_page_button").onclick = function(){
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {	
			chrome.tabs.sendMessage(tabs[0].id,{method:'toggle_page' }, function(response) {});
		});
	};

	document.getElementById("temp_disable_button").onclick = function(){
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {	
			chrome.tabs.sendMessage(tabs[0].id,{method:'toggle_global' }, function(response) {});
		});
	};

})();

