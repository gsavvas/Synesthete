(function () {
	const { getSettings, setBlockedDomains } = SynesthetizeStorage;

	const disableToggle = document.getElementById('disable_page_button');
	const hostnameTextField = document.getElementById('hostname_text');
	const statusTextField = document.getElementById('status_text');
	const reloadContentField = document.getElementById('reload_content');
	const unsupportedMessage = document.getElementById('unsupported_message');

	let currentHostname = '';

	function isSupportedUrl(url) {
		if (!url) {
			return false;
		}
		return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('file://');
	}

	function showUnsupported(message) {
		hostnameTextField.textContent = '—';
		statusTextField.textContent = 'unavailable';
		disableToggle.disabled = true;
		disableToggle.textContent = 'Toggle unavailable';
		unsupportedMessage.hidden = false;
		unsupportedMessage.textContent = message;
		reloadContentField.textContent = '';
	}

	function showReloadMessage() {
		reloadContentField.textContent = 'Changes apply automatically on open tabs.';
	}

	function setPopupText(blockedDomains, tabHost, supported) {
		currentHostname = tabHost || '';

		if (!supported) {
			showUnsupported('Synesthetize cannot run on browser internal pages such as chrome://, edge://, or the Chrome Web Store.');
			return;
		}

		unsupportedMessage.hidden = true;
		unsupportedMessage.textContent = '';
		disableToggle.disabled = false;
		hostnameTextField.textContent = tabHost;

		if (blockedDomains.includes(tabHost)) {
			statusTextField.textContent = 'disabled';
			disableToggle.textContent = 'Enable for this site';
		} else {
			statusTextField.textContent = 'enabled';
			disableToggle.textContent = 'Disable for this site';
		}
	}

	function setPopupTextFromActiveTab() {
		getSettings().then(function (settings) {
			chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
				if (!tabs.length) {
					showUnsupported('No active tab found.');
					return;
				}

				const tab = tabs[0];
				if (!isSupportedUrl(tab.url)) {
					setPopupText(settings.blockedDomains, '', false);
					return;
				}

				let tabHost = '';
				try {
					tabHost = new URL(tab.url).hostname;
				} catch (e) {
					showUnsupported('This page URL could not be read.');
					return;
				}

				setPopupText(settings.blockedDomains, tabHost, true);
			});
		});
	}

	disableToggle.addEventListener('click', function () {
		if (!currentHostname || disableToggle.disabled) {
			return;
		}

		getSettings().then(function (settings) {
			let blockedDomains = settings.blockedDomains.slice();
			if (blockedDomains.includes(currentHostname)) {
				blockedDomains = blockedDomains.filter(function (domain) {
					return domain !== currentHostname;
				});
			} else {
				blockedDomains.push(currentHostname);
			}

			return setBlockedDomains(blockedDomains).then(function () {
				setPopupText(blockedDomains, currentHostname, true);
				showReloadMessage();
			});
		});
	});

	setPopupTextFromActiveTab();
})();
