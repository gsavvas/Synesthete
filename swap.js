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

//get array of letters and their corresponding colors
chrome.extension.sendRequest({method: "getColors"}, function(response) {
  console.log(response.colors);

  for( x=0; x<26; x++){
    var let = itoa( atoi('A') + x);
    var mlet = "let" + let;
    //document.write('letter:' + let+ ' the stored result is: ' + localStorage[mlet] + "<br>" );
    if(response.colors[x]){
      $('body').highlight(let,response.colors[x]);
  }
  
}  
  
  
  
});

/*
//set defaults if not yet defined
if (!localStorage['saved']){
  localStorage['letA'] = '#800000'; //maroon
  localStorage['letE'] = '#008000'; //green
  localStorage['letI'] = '#0000ff'; //blue
  localStorage['letO'] = '#008080'; //teal
  localStorage['letU'] = '#800080'; //purple
  localStorage['saved'] = 'Y'

}
*/
/*
//for each letter, if it's not 
for( x=0; x<26; x++){
  var let = itoa( atoi('A') + x);
  var mlet = "let" + let;
  //document.write('letter:' + let+ ' the stored result is: ' + localStorage[mlet] + "<br>" );
  if(localStorage[mlet]){
    $('*').highlight(let,localStorage[mlet]);
  }
  
}
*/