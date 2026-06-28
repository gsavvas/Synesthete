(function () {
	const { getSettings, ensureDefaults, sortRulesByLength } = SynesthetizeStorage;

	const STYLE_ELEMENT_ID = 'synesthetize-styles';
	let observer = null;
	let pendingHighlight = null;
	let activeColorClasses = [];

	function toColorClass(str) {
		return 'syn-' + str.replace(/[^a-zA-Z0-9_-]/g, '_') + '-class';
	}

	function isHighlightElement(node) {
		return node && node.nodeType === 1 && node.getAttribute && node.getAttribute('data-synesthetize') === '1';
	}

	function shouldProcessNode(node) {
		if (!node || node.nodeType !== 1) {
			return false;
		}
		if (isHighlightElement(node)) {
			return false;
		}
		if (activeColorClasses.some(function (className) {
			return node.classList && node.classList.contains(className);
		})) {
			return false;
		}
		return true;
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
			return '.' + colorClass + ' { color: ' + elm.clr + '; }';
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
	}

	function scheduleHighlight(colors, nodes) {
		if (pendingHighlight) {
			clearTimeout(pendingHighlight);
		}
		pendingHighlight = setTimeout(function () {
			pendingHighlight = null;
			nodes.forEach(function (node) {
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
				if (mutation.type !== 'childList' || mutation.addedNodes.length === 0) {
					return;
				}
				mutation.addedNodes.forEach(function (node) {
					if (shouldProcessNode(node)) {
						nodesToProcess.push(node);
					}
				});
			});

			if (nodesToProcess.length > 0) {
				scheduleHighlight(colors, nodesToProcess);
			}
		});

		observer.observe(document.body, { childList: true, subtree: true });
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
