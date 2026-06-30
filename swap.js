(function () {
	const { getSettings, ensureDefaults, sortRulesByLength } = SynesthetizeStorage;

	const STYLE_ELEMENT_ID = 'synesthetize-styles';
	const INITIAL_WORK_BUDGET_MS = 24;
	const STEADY_WORK_BUDGET_MS = 8;
	const MUTATION_DEBOUNCE_MS = 50;

	let observer = null;
	let pendingMutationTimer = null;
	let pendingMutationNodes = new Set();
	let activeColorClasses = [];
	let activeColors = [];
	let activePatterns = [];
	let workGeneration = 0;
	let workQueue = [];
	let scanRoot = null;
	let scanWalker = null;
	let scheduledWorkId = null;
	let isActive = false;
	let suppressMutationHighlight = false;
	let bulkScanActive = false;

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

	function isInsideHighlight(node) {
		let parent = node && node.nodeType === 1 ? node : node && node.parentNode;
		while (parent) {
			if (isHighlightElement(parent)) {
				return true;
			}
			parent = parent.parentNode;
		}
		return false;
	}

	function isExcludedParentElement(node) {
		if (!node || node.nodeType !== 1) {
			return false;
		}
		if (/(script|style|noscript)/i.test(node.tagName)) {
			return true;
		}
		if (isHighlightElement(node)) {
			return true;
		}
		if (isInsideEditable(node)) {
			return true;
		}
		return false;
	}

	function shouldProcessElement(node) {
		if (!node || node.nodeType !== 1) {
			return false;
		}
		if (isExcludedParentElement(node)) {
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

	function isProcessableTextNode(textNode) {
		if (!textNode || textNode.nodeType !== 3) {
			return false;
		}
		const parent = textNode.parentElement;
		if (!parent || isExcludedParentElement(parent)) {
			return false;
		}
		if (isInsideHighlight(textNode)) {
			return false;
		}
		return textNode.data.length > 0;
	}

	function buildPatterns(colors) {
		return colors.map(function (rule) {
			return {
				upper: rule.str.toUpperCase(),
				length: rule.str.length,
				className: toColorClass(rule.str)
			};
		});
	}

	function findFirstMatch(text, patterns) {
		const upper = text.toUpperCase();
		let best = null;

		patterns.forEach(function (pattern) {
			if (!pattern.length) {
				return;
			}
			const index = upper.indexOf(pattern.upper);
			if (index === -1) {
				return;
			}
			if (!best || index < best.start || (index === best.start && pattern.length > best.length)) {
				best = {
					start: index,
					length: pattern.length,
					className: pattern.className
				};
			}
		});

		return best;
	}

	function getWorkBudget() {
		return bulkScanActive ? INITIAL_WORK_BUDGET_MS : STEADY_WORK_BUDGET_MS;
	}

	function hasTimeRemaining(startTime) {
		return performance.now() - startTime < getWorkBudget();
	}

	function highlightTextNode(textNode, patterns, generation, startTime) {
		if (generation !== workGeneration || !isProcessableTextNode(textNode)) {
			return false;
		}

		let currentNode = textNode;

		while (generation === workGeneration && isProcessableTextNode(currentNode)) {
			if (!hasTimeRemaining(startTime)) {
				return true;
			}

			const match = findFirstMatch(currentNode.data, patterns);
			if (!match) {
				return false;
			}

			const span = document.createElement('span');
			span.className = match.className;
			span.setAttribute('data-synesthetize', '1');

			const parent = currentNode.parentNode;
			const matchedText = currentNode.splitText(match.start);
			const afterText = matchedText.splitText(match.length);
			span.appendChild(matchedText);
			parent.insertBefore(span, afterText);

			currentNode = afterText;
		}

		return false;
	}

	function createTextWalker(root) {
		return document.createTreeWalker(
			root,
			NodeFilter.SHOW_TEXT,
			{
				acceptNode: function (node) {
					return isProcessableTextNode(node)
						? NodeFilter.FILTER_ACCEPT
						: NodeFilter.FILTER_REJECT;
				}
			}
		);
	}

	function resetScanState() {
		scanRoot = null;
		scanWalker = null;
	}

	function processElementRoot(element, patterns, generation, startTime) {
		if (scanRoot !== element || !scanWalker) {
			scanRoot = element;
			scanWalker = createTextWalker(element);
		}

		let textNode;
		while (textNode = scanWalker.nextNode()) {
			if (generation !== workGeneration) {
				resetScanState();
				return 'cancelled';
			}
			if (!hasTimeRemaining(startTime)) {
				return 'paused';
			}

			if (findFirstMatch(textNode.data, patterns)) {
				const paused = highlightTextNode(textNode, patterns, generation, startTime);
				scanWalker = createTextWalker(element);
				if (paused) {
					return 'paused';
				}
			}
		}

		resetScanState();
		return 'done';
	}

	function cancelScheduledWork() {
		if (scheduledWorkId !== null) {
			clearTimeout(scheduledWorkId);
			scheduledWorkId = null;
		}
	}

	function cancelHighlightWork() {
		workGeneration += 1;
		workQueue = [];
		resetScanState();
		cancelScheduledWork();
	}

	function scheduleHighlightWork() {
		if (scheduledWorkId !== null || workQueue.length === 0) {
			return;
		}
		scheduledWorkId = setTimeout(runHighlightWork, 0);
	}

	function isQueued(element) {
		return workQueue.indexOf(element) !== -1;
	}

	function enqueueHighlightRoots(roots) {
		let added = false;
		roots.forEach(function (node) {
			const element = getProcessableElement(node);
			if (shouldProcessElement(element) && !isQueued(element)) {
				workQueue.push(element);
				added = true;
			}
		});
		if (added) {
			bulkScanActive = true;
			scheduleHighlightWork();
		}
	}

	function runHighlightWork() {
		scheduledWorkId = null;
		const generation = workGeneration;
		const startTime = performance.now();
		suppressMutationHighlight = true;

		try {
			while (hasTimeRemaining(startTime)) {
				if (generation !== workGeneration) {
					return;
				}
				if (workQueue.length === 0) {
					bulkScanActive = false;
					return;
				}

				const root = workQueue[0];
				if (!shouldProcessElement(root)) {
					workQueue.shift();
					resetScanState();
					continue;
				}

				const result = processElementRoot(root, activePatterns, generation, startTime);
				if (result === 'cancelled') {
					return;
				}
				if (result === 'done') {
					workQueue.shift();
					continue;
				}
				break;
			}
		} finally {
			suppressMutationHighlight = false;
		}

		if (generation === workGeneration && workQueue.length > 0) {
			scheduleHighlightWork();
		} else if (workQueue.length === 0) {
			bulkScanActive = false;
		}
	}

	function collectScanRoots() {
		const roots = [];
		const seen = new Set();

		function add(node) {
			if (!node || !shouldProcessElement(node) || seen.has(node)) {
				return;
			}
			seen.add(node);
			roots.push(node);
		}

		document.querySelectorAll(
			'#mp-left, #mp-right, #mp-lower, #mp-bottom, #mp-topbanner, #mp-middle, #mp-upper'
		).forEach(add);

		document.querySelectorAll(
			'shreddit-post, [data-testid="post-container"], article, [role="article"]'
		).forEach(add);

		const parserOutput = document.querySelector('.mw-parser-output');
		if (parserOutput) {
			parserOutput.querySelectorAll(':scope > *').forEach(add);
		}

		const contentText = document.querySelector('#mw-content-text');
		if (contentText) {
			contentText.querySelectorAll(':scope > *').forEach(add);
		}

		if (roots.length === 0) {
			add(document.querySelector('#mw-content-text'));
			add(document.querySelector('#bodyContent'));
			add(document.body);
		}

		return roots;
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
		if (!document.body) {
			return;
		}
		const highlights = Array.from(document.body.querySelectorAll('[data-synesthetize="1"]'));
		highlights.forEach(function (span) {
			const parent = span.parentNode;
			if (!parent) {
				return;
			}
			while (span.firstChild) {
				parent.insertBefore(span.firstChild, span);
			}
			parent.removeChild(span);
			parent.normalize();
		});
	}

	function stopObserver() {
		if (observer) {
			observer.disconnect();
			observer = null;
		}
		if (pendingMutationTimer) {
			clearTimeout(pendingMutationTimer);
			pendingMutationTimer = null;
		}
		pendingMutationNodes.clear();
	}

	function scheduleMutationHighlight(nodes) {
		nodes.forEach(function (node) {
			const element = getProcessableElement(node);
			if (shouldProcessElement(element)) {
				pendingMutationNodes.add(element);
			}
		});
		if (pendingMutationNodes.size === 0) {
			return;
		}
		if (pendingMutationTimer) {
			clearTimeout(pendingMutationTimer);
		}
		pendingMutationTimer = setTimeout(function () {
			pendingMutationTimer = null;
			const nodesToProcess = Array.from(pendingMutationNodes);
			pendingMutationNodes.clear();
			enqueueHighlightRoots(nodesToProcess);
		}, MUTATION_DEBOUNCE_MS);
	}

	function startObserver() {
		if (observer) {
			observer.disconnect();
		}
		if (!document.body) {
			return;
		}

		observer = new MutationObserver(function (mutationsList) {
			if (suppressMutationHighlight) {
				return;
			}

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
				scheduleMutationHighlight(nodesToProcess);
			}
		});

		observer.observe(document.body, { childList: true, characterData: true, subtree: true });
	}

	function scanPage() {
		if (!isActive || !document.body) {
			return;
		}
		enqueueHighlightRoots(collectScanRoots());
	}

	function activate(letBlocks) {
		const colors = sortRulesByLength(letBlocks);
		if (colors.length === 0) {
			deactivate();
			return;
		}

		activeColors = colors;
		activePatterns = buildPatterns(colors);
		activeColorClasses = colors.map(function (elm) {
			return toColorClass(elm.str);
		});

		stopObserver();
		cancelHighlightWork();

		injectStyles(colors);

		if (isActive) {
			clearHighlights();
		}
		isActive = true;

		scanPage();
		startObserver();
	}

	function deactivate() {
		stopObserver();
		cancelHighlightWork();
		clearHighlights();
		activeColors = [];
		activePatterns = [];
		activeColorClasses = [];
		isActive = false;
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
		}).catch(function () {
			activate(SynesthetizeDefaults.DEFAULT_LET_BLOCKS);
		});

		chrome.storage.onChanged.addListener(function (changes, areaName) {
			if (areaName !== 'local') {
				return;
			}
			if (changes.letBlocks || changes.blockedDomains) {
				refreshFromStorage();
			}
		});

		window.addEventListener('load', scanPage);
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
