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

//just an array of number to letter mappings
var letters = new Array()
for( x=0; x<26; x++){
  letters[x] = itoa( atoi('a') + x);
}

for( x=26; x<36; x++){
  letters[x] = itoa( atoi('0') + x - 26);
}

//get array of letters and their corresponding colors
chrome.extension.sendRequest({method: "getColors"}, function(response) {
  //console.log(response.colors);

  for( x=0; x<26; x++){
    var let = itoa( atoi('A') + x);
    var mlet = "let" + let;
    //document.write('letter:' + let+ ' the stored result is: ' + localStorage[mlet] + "<br>" );
    if(response.colors[x]){
      $('body').highlight(let,response.colors[x]);
  }
  
}

  for( x=26; x<36; x++){
    var let = itoa( atoi('0') + x - 26);
    var mlet = "let" + let;
	//console.log("index:" + x + " char:" + let + " color:" + response.colors[x] );
    //document.write('letter:' + let+ ' the stored result is: ' + localStorage[mlet] + "<br>" );
    if(response.colors[x]){
      $('body').highlight(let,response.colors[x]);
  }
  
} 
  
  
  
});