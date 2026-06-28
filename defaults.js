(function (global) {
	const DEFAULT_LET_BLOCKS = [
		{ str: 'A', clr: '#800000' },
		{ str: 'E', clr: '#008000' },
		{ str: 'I', clr: '#0000ff' },
		{ str: 'O', clr: '#008080' },
		{ str: 'U', clr: '#800080' }
	];

	const DEFAULT_BLOCKED_DOMAINS = ['example.com', 'dogs.com'];

	global.SynesthetizeDefaults = {
		DEFAULT_LET_BLOCKS,
		DEFAULT_BLOCKED_DOMAINS
	};
})(typeof self !== 'undefined' ? self : this);
