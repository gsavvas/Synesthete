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
	
	var applyHighlighting = function(colors, node){
		colors.forEach(function(elm){
			let mclass =  elm.str+'-class';
			
			
			//console.log('attempting to highlight:', node);
			$(node).highlight(elm.str,mclass);
				//node.highlight(elm.str, elm.str+'-class');

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
			
			
			let debounceTimer;

			// Define the observer to watch for new nodes or modified text content
			const observer = new MutationObserver((mutationsList) => {
				let shouldHighlight = false;
				//return false;

				mutationsList.forEach(mutation => {
					//ignore mutations that this extension causes
					//if (mutation.target.classList.contains("highlighted")) return;

					if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
						shouldHighlight = true;
						mutation.addedNodes.forEach(function(node){
							//do not re-highlight if it's already highlighted
							if (node && node.nodeType === 1 && node.classList && !(colorClasses.some(className => node.classList.contains(className)))) {
								applyHighlighting(colors, node);
							}
						});
					} else if (mutation.type === "characterData") {
						shouldHighlight = true;
					}
				});

				// Apply highlighting only if relevant changes occurred
				/*if (shouldHighlight) {
					clearTimeout(debounceTimer);
					debounceTimer = setTimeout(applyHighlighting(colors), 500);
					console.log("tried to highlight based on update");
					colors.forEach(function(elm){
						$('body').highlight(elm.str, elm.str+'-class');
						
					});
				
				}
				*/
			});

			// Start observing changes in the document body
			observer.observe(document.body, { childList: true, subtree: true });


			
		}
	});



})();