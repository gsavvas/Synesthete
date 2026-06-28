(function () {
	const {
		DEFAULT_LET_BLOCKS,
		DEFAULT_BLOCKED_DOMAINS
	} = SynesthetizeDefaults;
	const {
		getSettings,
		setLetBlocks,
		setBlockedDomains,
		isValidDomain
	} = SynesthetizeStorage;

	const listEl = document.getElementById('list');
	const addButtonEl = document.getElementById('addButton');
	const domainListEl = document.getElementById('domainList');
	const addDomainEl = document.getElementById('addDomain');
	const colorMessageEl = document.getElementById('color_message');
	const domainMessageEl = document.getElementById('domain_message');
	const addCharacterEl = document.getElementById('add_character');
	const addColorEl = document.getElementById('add_color');
	const addSiteEl = document.getElementById('add_site');

	let colors = [];
	let domains = [];

	function setMessage(el, text, isSuccess) {
		el.textContent = text || '';
		el.classList.toggle('success', !!isSuccess);
	}

	function normalizeRuleString(value) {
		return value.trim();
	}

	function ruleExists(str) {
		const normalized = str.toUpperCase();
		return colors.some(function (item) {
			return item.str.toUpperCase() === normalized;
		});
	}

	function domainExists(domain) {
		const normalized = domain.toLowerCase();
		return domains.some(function (item) {
			return item.toLowerCase() === normalized;
		});
	}

	function createRemoveButton(label, id) {
		const button = document.createElement('button');
		button.type = 'button';
		button.id = id;
		button.textContent = 'Remove';
		button.setAttribute('aria-label', label);
		return button;
	}

	function renderColorList() {
		listEl.replaceChildren();
		colors.forEach(function (elm, index) {
			const li = document.createElement('li');

			const label = document.createElement('span');
			label.className = 'rule-label';
			label.style.color = elm.clr;
			label.textContent = elm.str + ' : ' + elm.clr;

			const removeButton = createRemoveButton('Remove rule for ' + elm.str, 'btn_' + index);
			removeButton.addEventListener('click', function () {
				colors.splice(index, 1);
				setLetBlocks(colors).then(refresh);
			});

			li.appendChild(label);
			li.appendChild(removeButton);
			listEl.appendChild(li);
		});
	}

	function renderDomainList() {
		domainListEl.replaceChildren();
		domains.forEach(function (elm, index) {
			const li = document.createElement('li');

			const label = document.createElement('span');
			label.className = 'rule-label';
			label.textContent = elm;

			const removeButton = createRemoveButton('Remove blocked site ' + elm, 'btn_domain_' + index);
			removeButton.addEventListener('click', function () {
				domains.splice(index, 1);
				setBlockedDomains(domains).then(refresh);
			});

			li.appendChild(label);
			li.appendChild(removeButton);
			domainListEl.appendChild(li);
		});
	}

	function refresh() {
		return getSettings().then(function (settings) {
			colors = settings.letBlocks;
			domains = settings.blockedDomains;
			renderColorList();
			renderDomainList();
		});
	}

	addButtonEl.addEventListener('click', function () {
		const character = normalizeRuleString(addCharacterEl.value);
		const color = addColorEl.value;

		if (!character) {
			setMessage(colorMessageEl, 'Enter a character or string to add.');
			return;
		}
		if (ruleExists(character)) {
			setMessage(colorMessageEl, 'That rule already exists.');
			return;
		}

		colors.push({ str: character, clr: color });
		setLetBlocks(colors).then(function () {
			addCharacterEl.value = '';
			setMessage(colorMessageEl, 'Rule added.', true);
			return refresh();
		});
	});

	addDomainEl.addEventListener('click', function () {
		const newDomain = normalizeRuleString(addSiteEl.value).toLowerCase();

		if (!newDomain) {
			setMessage(domainMessageEl, 'Enter a site domain to add.');
			return;
		}
		if (!isValidDomain(newDomain)) {
			setMessage(domainMessageEl, 'Enter a valid domain such as example.com.');
			return;
		}
		if (domainExists(newDomain)) {
			setMessage(domainMessageEl, 'That site is already in the list.');
			return;
		}

		domains.push(newDomain);
		setBlockedDomains(domains).then(function () {
			addSiteEl.value = '';
			setMessage(domainMessageEl, 'Site added.', true);
			return refresh();
		});
	});

	document.getElementById('resetButton').addEventListener('click', function () {
		Promise.all([
			setLetBlocks(DEFAULT_LET_BLOCKS.slice()),
			setBlockedDomains(DEFAULT_BLOCKED_DOMAINS.slice())
		]).then(function () {
			setMessage(colorMessageEl, 'Defaults restored.', true);
			setMessage(domainMessageEl, '', true);
			return refresh();
		});
	});

	refresh();
})();
