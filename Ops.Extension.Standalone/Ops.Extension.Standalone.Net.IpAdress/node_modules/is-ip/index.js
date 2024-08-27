import ipRegex from 'ip-regex';
import {isMatch} from 'super-regex';

const maxIPv4Length = 15;
const maxIPv6Length = 45;

const options = {
	timeout: 400,
};

export function isIP(string) {
	if (string.length > maxIPv6Length) {
		return false;
	}

	return isMatch(ipRegex({exact: true}), string, options);
}

export function isIPv6(string) {
	if (string.length > maxIPv6Length) {
		return false;
	}

	return isMatch(ipRegex.v6({exact: true}), string, options);
}

export function isIPv4(string) {
	if (string.length > maxIPv4Length) {
		return false;
	}

	return isMatch(ipRegex.v4({exact: true}), string, options);
}

export function ipVersion(string) {
	if (isIPv6(string)) {
		return 6;
	}

	if (isIPv4(string)) {
		return 4;
	}
}
