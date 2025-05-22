(function(){
	//initialize local storage if not previously setup
    chrome.storage.local.get(["letBlocks", "blockedDomains"], function(result) {

        if (!result.hasOwnProperty("letBlocks")) {
            let item = [
                {str: 'A', clr: '#800000'}, //maroon
                {str: 'E', clr: '#008000'}, //green
                {str: 'I', clr: '#0000ff'}, //blue
                {str: 'O', clr: '#008080'}, //teal
                {str: 'U', clr: '#800080'}  //purple
            ];
            chrome.storage.local.set({'letBlocks': JSON.stringify(item)});
        }

        if (!result.hasOwnProperty("blockedDomains")) {
            let domains = ["example.com","dogs.com"];
            chrome.storage.local.set({"blockedDomains": JSON.stringify(domains)});
        }
    });	
	
	var applyHighlighting = function(colors, node){
		//console.log('attempting to highlight:', node);
		colors.forEach(function(elm){
			let mclass =  elm.str+'-class';
			
			$(node).highlight(elm.str,mclass);
			

		});
	};
	
	//load configuration of blocked domains	and colors	
	chrome.storage.local.get(["letBlocks", "blockedDomains"]).then((result) => {
		domains = JSON.parse(result.blockedDomains);
		//only do any of the exciting things if we're not blocked on this domain
		if(!domains.includes(window.location.hostname)){
			colors = JSON.parse(result.letBlocks);
			$("<style type='text/css'> .unhighlight {color:''} </style>").appendTo("head");
			let colorClasses = [];

			var bod_el = document.getElementsByTagName('body')[0];
			
			colors.forEach(function(elm){
				colorClass = elm.str+'-class';
				colorClasses.push(colorClass);
				$('body').highlight(elm.str, colorClass);
				$("<style type='text/css'> ." + colorClass+" {color:" + elm.clr + "} </style>").appendTo("head");
				
			});
			

			// Define the observer to watch for new nodes or modified text content
			const observer = new MutationObserver((mutationsList) => {
				
				mutationsList.forEach(mutation => {
					//console.log(mutation);
					
					//we handle two types: childLists where we go through the child nodes and characterData changes, where we re-evaluate the node itself.
					if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
						mutation.addedNodes.forEach(function(node){
							//do not re-highlight if it's already highlighted. Otherwise, try to highlight.
							if (node && node.nodeType === 1 && node.classList && !(colorClasses.some(className => node.classList.contains(className)))) {
								applyHighlighting(colors, node);
							}
						}); 
					} else if (mutation.type === "characterData") {
						//skip this for now; causes pages to hang
						/*node = mutation.target;
						if( node && node.nodeType === 3 && node.parentElement && node.parentElement.classList && !(colorClasses.some(className => node.parentElement.classList.contains(className)))){
							//console.log("highlighting from characterData", mutation);
							applyHighlighting(colors, node.parentElement);	
						}
						*/
					}
				});


			});

			// Start observing changes in the document body
			observer.observe(document.body, { childList: true, subtree: true, characterData: true , attributes: true });


			
		}
	});



})();