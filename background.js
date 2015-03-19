(function(){
if (!localStorage.letBlocks){
	var item = Array(5); 
	item[0] = {str: 'A', clr: '#800000'}; //maroon
	item[1] = {str: 'E',clr: '#008000'}; //green
	item[2] = {str: 'I', clr: '#0000ff'}; //blue
	item[3] = {str: 'O', clr:'#008080'}; //teal
	item[4] = {str:'U',clr: '#800080'}; //purple
  localStorage["letBlocks"] = JSON.stringify(item);
  localStorage['saved'] = 'Y';

}

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	if (request.method == "getColors"){
		var letBlocks = JSON.parse(localStorage.letBlocks);

		sendResponse(letBlocks);
  } else if(request.method === "get_temp_disable") {
		sendResponse({disabled:window.localStorage.temp_disable}); // snub them.
  } else if(request.method === 'toggle_temp_disable'){

  	if(window.localStorage.temp_disable === "Y"){
			window.localStorage.temp_disable = null;
  	}
		else{
			window.localStorage.temp_disable = "Y";
		}

		sendResponse({suc:"success"});
  } else {
		sendResponse({}); // snub them.
  }
});




})();