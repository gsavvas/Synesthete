/*

highlight v4 (Synesthetize fork)

Highlights arbitrary terms.

<http://johannburkard.de/blog/programming/javascript/highlight-javascript-text-higlighting-jquery-plugin.html>

MIT license.

Johann Burkard
<http://johannburkard.de>
<mailto:jb@eaio.com>

*/

jQuery.fn.highlight = function(pat, className) {
	function isInsideHighlight(node) {
		var parent = node.parentNode;
		while (parent) {
			if (parent.nodeType === 1 && parent.getAttribute && parent.getAttribute('data-synesthetize') === '1') {
				return true;
			}
			parent = parent.parentNode;
		}
		return false;
	}

	function innerHighlight(node, pat) {
		var skip = 0;
		if (node.nodeType === 3) {
			if (isInsideHighlight(node)) {
				return skip;
			}
			var pos = node.data.toUpperCase().indexOf(pat);
			if (pos >= 0) {
				var spannode = document.createElement('span');
				spannode.className = className;
				spannode.setAttribute('data-synesthetize', '1');
				var middlebit = node.splitText(pos);
				middlebit.splitText(pat.length);
				var middleclone = middlebit.cloneNode(true);
				spannode.appendChild(middleclone);
				middlebit.parentNode.replaceChild(spannode, middlebit);
				skip = 1;
			}
		} else if (node.nodeType === 1 && node.childNodes && !/(script|style|textarea|noscript)/i.test(node.tagName)) {
			if (node.getAttribute && node.getAttribute('data-synesthetize') === '1') {
				return skip;
			}
			for (var i = 0; i < node.childNodes.length; ++i) {
				i += innerHighlight(node.childNodes[i], pat);
			}
		}
		return skip;
	}

	return this.length && pat && pat.length ? this.each(function() {
		innerHighlight(this, pat.toUpperCase());
	}) : this;
};

jQuery.fn.removeHighlight = function() {
	return this.find('[data-synesthetize="1"]').each(function() {
		var parent = this.parentNode;
		if (!parent) {
			return;
		}
		while (this.firstChild) {
			parent.insertBefore(this.firstChild, this);
		}
		parent.removeChild(this);
		parent.normalize();
	}).end();
};
