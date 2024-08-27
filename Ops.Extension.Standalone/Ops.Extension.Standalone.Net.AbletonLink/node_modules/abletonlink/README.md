# node-abletonlink

node.js port of [ableton Link](https://github.com/ableton/link) with node-addon-api

## Dependencies

* [ableton/link](https://github.com/ableton/link)
    * [chriskohlhoff/asio](https://github.com/chriskohlhoff/asio)
    * [philsquared/Catch](https://github.com/philsquared/Catch)

## Required

see detail on [node-gyp](https://github.com/nodejs/node-gyp)

### Common

* python v2.7

### Mac

* Xcode

### UNIX

* make

### Windows

* Microsoft windows-build-tools (`npm install --global --production windows-build-tools`)

## Tested env

* OSX 10.14.6 with Xcode / node.js 10.16.0
* Windows 10 with windows-build-tools / node.js 10.16.0

## Install

```
npm install abletonlink
```

or

```
npm install 2bbb/node-abletonlink
```

## How to use

```js
const abletonlink = require('abletonlink');
const link = new abletonlink();

link.startUpdate(60, (beat, phase, bpm) => {
    console.log("updated: ", beat, phase, bpm);
});

// callback is option.
// link.startUpdate(60); // correct!

function do_something() {
    const beat = link.beat;
    const phase = link.phase;
    const bpm = link.bpm;
    ...
}
```

## Example

* [node-abletonlink-example](https://github.com/2bbb/node-abletonlink-example)

## API

`const abletonlink = require('abletonlink')`: Thread Safe
`abletonlink.Audio`: Not Thread Safe (but on node.js/V8...??)

## property

* `isLinkEnable`: `bool` [get/set]
* `isPlayStateSync`: `bool` [get/set]
* `numPeers`: `number` [get]

* `beat`: `number` [get/set]
* `bpm`: `number` [get/set]
* `phase`: `number` [get]
* `quantum`: `number` [get/set]

## method

* `getNumPeers`: `(void) -> number`
[deprecated from v0.0.8. use `numPeers` property]

get num peers.

* `setBeatForce`: `(beat: number) -> void`

set beat force.

* `on`: `(key: string, callback: (number) -> void) -> void`

set callback will call change event.

`key` is `'tempo'` then argument of callback is new `tempo` property.

`key` is `'numPeers'` then argument of callback is new `numPeers` property.

`key` is `'playState'` then argument of callback is new `isPlaying` property.

* `off` : `(key: string) -> void`

remove callback.

* `enable`: `(void) -> void`
* `disable`: `(void) -> void`

* `enablePlayStateSync`: `(void) -> void`
* `disablePlayStateSync`: `(void) -> void`

* `update`: `(void) -> void`

call update manually.

* `startUpdate`: `(interval: number [, callback: (beat:number, phase:number, bpm:number, playState: bool) -> void]) -> void`

start update timer with interval.

if given callback, it will call every interval with arguments `beat`, `phase`, `bpm`, `playState`.

* `stopUpdate`: `(void) -> void`

stop update timer.

## License

MIT

## Author

* ISHII 2bit [bufferRenaiss co., ltd.]
* ishii[at]buffer-renaiss.com

## Special Thanks

* [Hlöðver Sigurðsson (hlolli)](https://github.com/hlolli) [#3](https://github.com/2bbb/node-abletonlink/pull/3)
* [Yuichi Yogo (yuichkun)](https://github.com/yuichkun) [#10](https://github.com/2bbb/node-abletonlink/pull/10)
* [Jakob Miland](https://github.com/saebekassebil) [#11](https://github.com/2bbb/node-abletonlink/issues/11)
* [Alessandro Oniarti](https://github.com/Onni97) [#11](https://github.com/2bbb/node-abletonlink/issues/11)
* [Théis Bazin](https://github.com/tbazin) [#12](https://github.com/2bbb/node-abletonlink/pull/12), [#15](https://github.com/2bbb/node-abletonlink/pull/15)
* [Jeffrey Kog](https://github.com/jeffreykog) [#16](https://github.com/2bbb/node-abletonlink/issues/16)

## At last

If you get happy with using this addon, and you're rich, please donation for support continuous development.

Bitcoin: `17AbtW73aydfYH3epP8T3UDmmDCcXSGcaf`
