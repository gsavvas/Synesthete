(function(){
chrome.extension.sendRequest({method:"get_temp_disable"}, function(resp1){
	if(!((resp1.disabled)||(window.localStorage.disabled === "Y"))){ //Don't color anything!
		//This is just to access the localStorage and return the list of string/color pairs.
		chrome.extension.sendRequest({method: "getColors"}, function(resp2) {


		  $("<style type='text/css'> .unhighlight {color:''} </style>").appendTo("head");

			var bod_el = document.getElementsByTagName('body')[0];
		  resp2.forEach(function(elm){
		    $('body').highlight(elm.str, elm.str+'-class');
		    $("<style type='text/css'> ."+elm.str+"-class{ color:"+elm.clr+"} </style>").appendTo("head");
		  });

		});
	}
});



unhighlight_everything = function(){
	$("."+elm.str+"-class").removeClass(elm.str+"-class").addClass('unhighlight');
};

toggle_for_this_page = function(){
	if(window.localStorage.disabled === "Y")
		window.localStorage.disabled = null;
	else
		window.localStorage.disabled = "Y";
};

temp_toggle = function(){
		chrome.extension.sendRequest({method:"toggle_temp_disable"}, function(resp){ 
		});
};

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {


	if (request.method === 'toggle_page'){
		toggle_for_this_page();
		sendResponse("success");
	} else if(request.method === 'toggle_global'){
		temp_toggle();
		sendResponse("success");
	} else if(request.method === 'is_page_disabled'){
			if(window.localStorage.disabled === 'Y')
			sendResponse("disabled");
			else
				sendResponse({});
	}

});


})();