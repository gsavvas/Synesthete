(function () {
	const { getSettings, ensureDefaults, sortRulesByLength } = SynesthetizeStorage;

	const STYLE_ELEMENT_ID = 'synesthetize-styles';
	let observer = null;
	let pendingHighlight = null;
	let pendingNodes = new Set();
	let activeColorClasses = [];

	function toColorClass(str) {
		return 'syn-' + str.replace(/[^a-zA-Z0-9_-]/g, '_') + '-class';
	}

	function isHighlightElement(node) {
		return node && node.nodeType === 1 && node.getAttribute && node.getAttribute('data-synesthetize') === '1';
	}

	function isEditableElement(node) {
		if (!node || node.nodeType !== 1) {
			return false;
		}
		if (/(input|textarea|select|button)/i.test(node.tagName)) {
			return true;
		}
		if (node.isContentEditable) {
			return true;
		}
		if (node.getAttribute) {
			const contentEditable = node.getAttribute('contenteditable');
			return contentEditable === '' || /^(true|plaintext-only)$/i.test(contentEditable);
		}
		return false;
	}

	function isInsideEditable(node) {
		let parent = node && node.nodeType === 1 ? node : node && node.parentNode;
		while (parent) {
			if (isEditableElement(parent)) {
				return true;
			}
			parent = parent.parentNode;
		}
		return false;
	}

	function shouldProcessNode(node) {
		if (!node || node.nodeType !== 1) {
			return false;
		}
		if (isHighlightElement(node)) {
			return false;
		}
		if (isInsideEditable(node)) {
			return false;
		}
		if (activeColorClasses.some(function (className) {
			return node.classList && node.classList.contains(className);
		})) {
			return false;
		}
		return true;
	}

	function getProcessableElement(node) {
		if (!node) {
			return null;
		}
		if (node.nodeType === 1) {
			return node;
		}
		if (node.nodeType === 3) {
			return node.parentElement;
		}
		return null;
	}

	function applyHighlighting(colors, node) {
		colors.forEach(function (elm) {
			const mclass = toColorClass(elm.str);
			$(node).highlight(elm.str, mclass);
		});
	}

	function injectStyles(colors) {
		let styleEl = document.getElementById(STYLE_ELEMENT_ID);
		if (!styleEl) {
			styleEl = document.createElement('style');
			styleEl.id = STYLE_ELEMENT_ID;
			styleEl.type = 'text/css';
			document.head.appendChild(styleEl);
		}

		const css = colors.map(function (elm) {
			const colorClass = toColorClass(elm.str);
			return '.' + colorClass + ' { color: ' + elm.clr + ' !important; }';
		}).join('\n');

		styleEl.textContent = css;
	}

	function clearHighlights() {
		if (document.body) {
			$(document.body).removeHighlight();
		}
	}

	function stopObserver() {
		if (observer) {
			observer.disconnect();
			observer = null;
		}
		if (pendingHighlight) {
			clearTimeout(pendingHighlight);
			pendingHighlight = null;
		}
		pendingNodes.clear();
	}

	function scheduleHighlight(colors, nodes) {
		nodes.forEach(function (node) {
			const element = getProcessableElement(node);
			if (shouldProcessNode(element)) {
				pendingNodes.add(element);
			}
		});
		if (pendingNodes.size === 0) {
			return;
		}
		if (pendingHighlight) {
			clearTimeout(pendingHighlight);
		}
		pendingHighlight = setTimeout(function () {
			pendingHighlight = null;
			const nodesToProcess = Array.from(pendingNodes);
			pendingNodes.clear();
			nodesToProcess.forEach(function (node) {
				if (shouldProcessNode(node)) {
					applyHighlighting(colors, node);
				}
			});
		}, 50);
	}

	function startObserver(colors) {
		stopObserver();
		if (!document.body) {
			return;
		}

		observer = new MutationObserver(function (mutationsList) {
			const nodesToProcess = [];

			mutationsList.forEach(function (mutation) {
				if (mutation.type === 'characterData') {
					nodesToProcess.push(mutation.target);
					return;
				}
				if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
					mutation.addedNodes.forEach(function (node) {
						nodesToProcess.push(node);
					});
				}
			});

			if (nodesToProcess.length > 0) {
				scheduleHighlight(colors, nodesToProcess);
			}
		});

		observer.observe(document.body, { childList: true, characterData: true, subtree: true });
	}

	function activate(letBlocks) {
		const colors = sortRulesByLength(letBlocks);
		activeColorClasses = colors.map(function (elm) {
			return toColorClass(elm.str);
		});

		injectStyles(colors);
		clearHighlights();
		applyHighlighting(colors, document.body);
		startObserver(colors);
	}

	function deactivate() {
		stopObserver();
		clearHighlights();
		activeColorClasses = [];
		const styleEl = document.getElementById(STYLE_ELEMENT_ID);
		if (styleEl) {
			styleEl.remove();
		}
	}

	function refreshFromStorage() {
		return getSettings().then(function (settings) {
			const hostname = window.location.hostname;
			if (settings.blockedDomains.includes(hostname)) {
				deactivate();
				return;
			}
			activate(settings.letBlocks);
		});
	}

	function init() {
		ensureDefaults().then(function () {
			return refreshFromStorage();
		});

		chrome.storage.onChanged.addListener(function (changes, areaName) {
			if (areaName !== 'local') {
				return;
			}
			if (changes.letBlocks || changes.blockedDomains) {
				refreshFromStorage();
			}
		});
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
