(function(){
	
	var disable_toggle = document.getElementById('disable_page_button'),
		hostname_text_field = document.getElementById('hostname_text'),
		status_text_field = document.getElementById('status_text'),
		reload_content_field = document.getElementById('reload_content');
	
	
	
	var set_popup_text = function(){
		chrome.storage.local.get(["blockedDomains"]).then((result) => {
			chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
				let blockedDomains = JSON.parse(result.blockedDomains);
				if(tabs.length > 0){
					let tabURL = new URL(tabs[0].url);
					let tabHost = tabURL.hostname;
					if(blockedDomains.includes(tabHost) ){//blocked domain
						hostname_text_field.innerHTML = tabHost;
						status_text_field.innerHTML = 'disabled';
						disable_toggle.innerHTML = 'enable';
					} else{
						//not blocked domain
						hostname_text_field.innerHTML = tabHost;
						status_text_field.innerHTML = 'enabled';
						disable_toggle.innerHTML = 'disable';
					}
				} else{
					//no tab
					hostname_text_field.innerHTML = tabHost;
					status_text_field.innerHTML = 'enabled';
					disable_toggle.innerHTML = 'toggling not supported';
				}
			});
		});
		
		
	}
	

	show_reload_message = function(){
		reload_content_field.innerHTML = "Reload to see changes";
	}
	
	disable_toggle.onclick = function(){
		chrome.storage.local.get(["blockedDomains"]).then((result) => {
			chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
				let blockedDomains = JSON.parse(result.blockedDomains);
				if(tabs.length > 0){
					let tabURL = new URL(tabs[0].url);
					let tabHost = tabURL.hostname;
					if(blockedDomains.includes(tabHost) ){//blocked domain
						blockedDomains = blockedDomains.filter( e => e != tabHost);
						chrome.storage.local.set({'blockedDomains': JSON.stringify(blockedDomains)});
						set_popup_text();
						
					} else{
						//not blocked domain
						blockedDomains.push(tabHost);
						chrome.storage.local.set({'blockedDomains': JSON.stringify(blockedDomains)});
						set_popup_text();

					}
				} else{
					//do nothing
				}
					
			});
			
		});
		
		show_reload_message();
	};

	set_popup_text();
	
})();


