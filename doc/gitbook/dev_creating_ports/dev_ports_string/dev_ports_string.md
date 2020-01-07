# String ports

This page will explain how to create an input and output port of the type 'String'<br>

![Button](../img/creating_ports_string_port_color.png)<br> 

Click this [link](https://cables.gl/ui/#/project/5b9f692e671e52e512ab3af3) to see an example of all port types and code examples

JavaScript strings are used for storing and manipulating text
A string is zero or more characters written inside quotes

The following code snippet will create one input and output port of the type `String`<br>
The input string will be passed out of the output port

```javascript
//strict mode allows us to write cleaner code
"use strict";

//Create a input port of the type String
const inString  = op.inString("String in");
//Create a output port of the type String
const outString = op.outString("String out");

//when input port changes call the function 'update'
inString.onChange = update;

//this function runs every time the input port changes
function update()
{
    //if the input type is not a String then output a string instead
    if(!inString.get())outString.set('');
    //else set the output to the input string
    else outString.set(inString.get());
}
```

Follow this [link](../../dev_callbacks/dev_callbacks.md) for more information on Callbacks

