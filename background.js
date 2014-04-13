if (!localStorage['saved']){
  localStorage['letA'] = '#800000'; //maroon
  localStorage['letE'] = '#008000'; //green
  localStorage['letI'] = '#0000ff'; //blue
  localStorage['letO'] = '#008080'; //teal
  localStorage['letU'] = '#800080'; //purple
  
  localStorage['saved'] = 'Y';

}


// Converts an integer (unicode value) to a char
function itoa(i)
{ 
   return String.fromCharCode(i);
}

// Converts a char into to an integer (unicode value)
function atoi(a)
{ 
   return a.charCodeAt();
}


chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	if (request.method == "getColors"){
		var colorList = new Array();
		//first the letters
		for( x=0; x<26; x++){
			colorList[x] = localStorage['let' + itoa( atoi('A') + x) ];
		}
		//now the numbers...
		for( x=26; x<36; x++){
			colorList[x] = localStorage['let' + itoa( atoi('0') + x - 26) ];
		}
		sendResponse({colors: colorList});
	  }
    else{
		sendResponse({}); // snub them.
	  }
});