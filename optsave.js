// Saves options to localStorage.

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

// Restores select box state to saved value from localStorage.
function restore_options() {
 
  var mform = document.getElementById("mform");
  for( var x= 0; x < 26; x++) {
	var mlet = "let" + itoa( atoi('A') + x);
	var mbox = mform.elements[mlet] //document.getElementByID(mlet);
	//var index = mbox.selectedIndex;
	//var mbox = document.getElementById("let" + mlet );
	
	//document.write(mcolor)
	var mspan = document.getElementById( "letter" + itoa( atoi('A') + x) ) ;	
	if (localStorage[mlet]){
	  mbox.value = localStorage[mlet];
	  mspan.style.color = localStorage[mlet];
	  } else{
	  mbox.value = "";
	  mspan.style.color = '#000000'
	  }
	
  }
}

function save_options() {
  
  var mform = document.getElementById("mform")
  for( var x= 0; x < 26; x++) {
	var mlet = "let" + itoa( atoi('A') + x);
	//document.write(mlet)
	var mbox = mform.elements[mlet] //document.getElementByID(mlet);
	//var index = mbox.selectedIndex;
	//var mbox = document.getElementById("let" + mlet );
	var mcolor = mbox.value;
	//document.write(mcolor)
	localStorage[mlet] = mcolor; 
	//mform.elements[mlet].color = mcolor
  }
  

 var status = document.getElementById("status");
  status.innerHTML = "Options Saved!";
/*  setTimeout(function() {
    status.innerHTML = "";
  }, 1750);*/
  localStorage['saved'] = "Y"
  restore_options();
}


function clickHandler(e) {
  setTimeout(save_options, 1000);
}
// Add event listeners once the DOM has fully loaded by listening for the
// `DOMContentLoaded` event on the document, and adding your listeners to
// specific elements when it triggers.
document.addEventListener('DOMContentLoaded', function () {
  document.querySelector('button').addEventListener('click', clickHandler);
  restore_options()
});
