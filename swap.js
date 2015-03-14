(function(){

//This is just to access the localStorage and return the list of string/color pairs.
chrome.extension.sendRequest({method: "getColors"}, function(response) {
  //console.log(response.colors);

  console.log(response);


  response.forEach(function(elm){
    $('body').highlight(elm.str, elm.clr);
  });
  
});






})();