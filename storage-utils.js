(function (global) {
	const { DEFAULT_LET_BLOCKS, DEFAULT_BLOCKED_DOMAINS } = global.SynesthetizeDefaults;

	function parseArray(value, fallback) {
		if (Array.isArray(value)) {
			return value;
		}
		if (typeof value === 'string') {
			try {
				const parsed = JSON.parse(value);
				if (Array.isArray(parsed)) {
					return parsed;
				}
			} catch (e) {
				// fall through to fallback
			}
		}
		return fallback.slice();
	}

	function parseLetBlocks(value) {
		const blocks = parseArray(value, DEFAULT_LET_BLOCKS);
		return blocks.filter(function (item) {
			return item && typeof item.str === 'string' && typeof item.clr === 'string';
		});
	}

	function parseBlockedDomains(value) {
		const domains = parseArray(value, DEFAULT_BLOCKED_DOMAINS);
		return domains.filter(function (item) {
			return typeof item === 'string' && item.length > 0;
		});
	}

	function ensureDefaults() {
		return chrome.storage.local.get(['letBlocks', 'blockedDomains']).then(function (result) {
			const updates = {};
			if (!Object.prototype.hasOwnProperty.call(result, 'letBlocks')) {
				updates.letBlocks = DEFAULT_LET_BLOCKS.slice();
			}
			if (!Object.prototype.hasOwnProperty.call(result, 'blockedDomains')) {
				updates.blockedDomains = DEFAULT_BLOCKED_DOMAINS.slice();
			}
			if (Object.keys(updates).length > 0) {
				return chrome.storage.local.set(updates).then(function () {
					return getSettings();
				});
			}
			return getSettings();
		});
	}

	function getSettings() {
		return chrome.storage.local.get(['letBlocks', 'blockedDomains']).then(function (result) {
			const letBlocks = parseLetBlocks(result.letBlocks);
			const blockedDomains = parseBlockedDomains(result.blockedDomains);
			const updates = {};

			if (!Object.prototype.hasOwnProperty.call(result, 'letBlocks')) {
				updates.letBlocks = DEFAULT_LET_BLOCKS.slice();
			} else if (typeof result.letBlocks === 'string' || !Array.isArray(result.letBlocks)) {
				updates.letBlocks = letBlocks;
			}

			if (!Object.prototype.hasOwnProperty.call(result, 'blockedDomains')) {
				updates.blockedDomains = DEFAULT_BLOCKED_DOMAINS.slice();
			} else if (typeof result.blockedDomains === 'string' || !Array.isArray(result.blockedDomains)) {
				updates.blockedDomains = blockedDomains;
			}

			if (Object.keys(updates).length > 0) {
				return chrome.storage.local.set(updates).then(function () {
					return {
						letBlocks: updates.letBlocks || letBlocks,
						blockedDomains: updates.blockedDomains || blockedDomains
					};
				});
			}

			return { letBlocks: letBlocks, blockedDomains: blockedDomains };
		});
	}

	function setLetBlocks(letBlocks) {
		return chrome.storage.local.set({ letBlocks: letBlocks });
	}

	function setBlockedDomains(blockedDomains) {
		return chrome.storage.local.set({ blockedDomains: blockedDomains });
	}

	function isValidDomain(domain) {
		if (!domain || typeof domain !== 'string') {
			return false;
		}
		const trimmed = domain.trim().toLowerCase();
		if (!trimmed || trimmed.includes(' ')) {
			return false;
		}
		return /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(trimmed);
	}

	function sortRulesByLength(letBlocks) {
		return letBlocks.slice().sort(function (a, b) {
			return b.str.length - a.str.length;
		});
	}

	global.SynesthetizeStorage = {
		parseLetBlocks: parseLetBlocks,
		parseBlockedDomains: parseBlockedDomains,
		ensureDefaults: ensureDefaults,
		getSettings: getSettings,
		setLetBlocks: setLetBlocks,
		setBlockedDomains: setBlockedDomains,
		isValidDomain: isValidDomain,
		sortRulesByLength: sortRulesByLength
	};
})(typeof self !== 'undefined' ? self : this);
