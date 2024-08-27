# clone-regexp

> Clone and modify a [RegExp](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp) instance

## Install

```
$ npm install clone-regexp
```

## Usage

```js
import cloneRegexp from 'clone-regexp';

const regex = /[a-z]/gi;

cloneRegexp(regex);
//=> /[a-z]/gi

cloneRegexp(regex) === regex;
//=> false

cloneRegexp(regex, {global: false});
//=> /[a-z]/i

cloneRegexp(regex, {multiline: true});
//=> /[a-z]/gim

cloneRegexp(regex, {source: 'unicorn'});
//=> /unicorn/gi
```

## API

### cloneRegexp(regexp, options?)

#### regex

Type: `RegExp`

Regex to clone.

#### options

Type: `object`\
Properties: [`source`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/source) [`global`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/global) [`ignoreCase`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/ignoreCase) [`multiline`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/multiline) [`dotAll`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/dotAll) [`sticky`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/sticky) [`unicode`](http://norbertlindenberg.com/2012/05/ecmascript-supplementary-characters/#RegExp) [`lastIndex`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/lastIndex)

Optionally modify the cloned `RegExp` instance.
