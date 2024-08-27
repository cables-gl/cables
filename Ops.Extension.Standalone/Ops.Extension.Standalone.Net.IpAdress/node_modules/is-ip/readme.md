# is-ip

> Check if a string is an IP address

If you only need this for Node.js and don't care about browser support, you may want to use [`net.isIP`](https://nodejs.org/api/net.html#net_net_isip_input) instead. Note that it returns an integer instead of a boolean.

## Install

```sh
npm install is-ip
```

## Usage

```js
import {isIP, isIPv4} from 'is-ip';

isIP('1:2:3:4:5:6:7:8');
//=> true

isIP('192.168.0.1');
//=> true

isIPv4('1:2:3:4:5:6:7:8');
//=> false
```

## API

### isIP(string)

Check if `string` is IPv6 or IPv4.

### isIPv6(string)

Check if `string` is IPv6.

### isIPv4(string)

Check if `string` is IPv4.

### ipVersion(string)

Returns `6` if `string` is IPv6, `4` if `string` is IPv4, or `undefined` if `string` is neither.

```js
import {ipVersion} from 'is-ip';

ipVersion('1:2:3:4:5:6:7:8');
//=> 6

ipVersion('192.168.0.1');
//=> 4

ipVersion('abc');
//=> undefined
```

## Related

- [ip-regex](https://github.com/sindresorhus/ip-regex) - Regular expression for matching IP addresses
- [is-cidr](https://github.com/silverwind/is-cidr) - Check if a string is an IP address in CIDR notation
- [cidr-regex](https://github.com/silverwind/cidr-regex) - Regular expression for matching IP addresses in CIDR notation
