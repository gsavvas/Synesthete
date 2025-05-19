(function(){
	//initialize local storage if not previously setup
    chrome.storage.local.get(["letBlocks", "blockedDomains"], function(result) {

        if (!result.hasOwnProperty("letBlocks")) {
            let item = [
                {str: 'A', clr: '#800000'}, 
                {str: 'E', clr: '#008000'}, 
                {str: 'I', clr: '#0000ff'}, 
                {str: 'O', clr:'#008080'}, 
                {str: 'U',clr: '#800080'}
            ];
            chrome.storage.local.set({'letBlocks': JSON.stringify(item)});
        }

        if (!result.hasOwnProperty("blockedDomains")) {
            let domains = ["example.com","dogs.com"];
            chrome.storage.local.set({"blockedDomains": JSON.stringify(domains)});
        }
    });	
	
	
	
	//load configuration of blocked domains	and colors	
	chrome.storage.local.get(["letBlocks", "blockedDomains"]).then((result) => {
		domains = JSON.parse(result.blockedDomains);
		if(!domains.includes(window.location.hostname)){
			colors = JSON.parse(result.letBlocks);
			$("<style type='text/css'> .unhighlight {color:''} </style>").appendTo("head");

			var bod_el = document.getElementsByTagName('body')[0];
			colors.forEach(function(elm){
				$('body').highlight(elm.str, elm.str+'-class');
				$("<style type='text/css'> ." + elm.str + "-class {color:" + elm.clr + "} </style>").appendTo("head");
			});
		}
	});


/*
    function unhighlight_everything(elm){
        $("." + elm.str + "-class").removeClass(elm.str + "-class").addClass('unhighlight');
    }

    function toggle_for_this_page(){
        chrome.runtime.sendMessage({method: "toggle_page_disabled"}, function(response){
            console.log("Page disabled state toggled:", response);
        });
    }

    function temp_toggle(){
        chrome.runtime.sendMessage({method: "toggle_temp_disable"}, function(response){
            console.log("Global temporary disable toggled:", response);
        });
    }

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.method === "toggle_page"){
            toggle_for_this_page();
            sendResponse("success");
        } else if(request.method === "toggle_global"){
            temp_toggle();
            sendResponse("success");
        } else if(request.method === "is_page_disabled"){
            chrome.runtime.sendMessage({method: "get_disabled_status"}, function(response){
                sendResponse(response);
            });
            return true; // Required for async response handling
        }
    });
	*/

})();