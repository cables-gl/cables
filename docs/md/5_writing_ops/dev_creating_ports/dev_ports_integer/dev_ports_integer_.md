# Integer Number Ports

This page will explain how to create an input and ouput port of the type `Integer`

Click this [link](https://cables.gl/ui/#/project/5b9f692e671e52e512ab3af3) to see an example of all port types and code examples

Integer ports can hold a single integer like `-2 0 10 101`
They're useful when you want to have a parameter to access an array by index or don't want to have to use `Math.floor` on the numerical input.

```javascript
// strict mode allows us to write cleaner code
"use strict";

// Create a input port of the type value
const inInteger   = op.inInt("Integer in");
// Create a output port of the type value
const outResult  = op.outNumber("Value out");

// when input port changes call the function 'update'
inInteger.onChange = update;

// this function runs every time the input port changes
function update()
{
    outResult.set(inInteger.get());
}
```

Follow this [link](../../dev_callbacks/dev_callbacks) for more information on Callbacks
