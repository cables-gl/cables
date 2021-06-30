# Object Ports

This page will explain how to create an input and ouput port of the type `Object`<br>
![Button](../img/creating_ports_object_port_color.png) <br>

Click this [link](https://cables.gl/ui/#/project/5b9f692e671e52e512ab3af3) to see an example of all port types and code examples

Object ports can accept any kind of object, e.g.:

{
  'foo': 'bar',
  'baz': 123
}
These objects can be as complex as necessary.

Code example below:

```javascript

"use strict";

/*
Check the example patch to see how this part works

Click the 'ParseObject' op that's connected to
this one. Then click 'Edit' next to JSON String
to see the following code:

{
    "hello" : "world",
    "one" : "2"
}
*/

//Create a input port of the type value
const inObj  = op.inObject("Object in");
//Create a output port of the type value
const outKeyVal=op.outString("Test");

//when input port changes call the function 'update'
inObj.onChange=update;

//this function runs every time the input port changes
function update()
{
    //if the inObj port can't read anything then
    //the output port is set to unknown
    if(!inObj.get()) outKeyVal.set( 'unknown' );
    //if the key value coming in matches 'hello'
    //then get the key value associated with the in port
    //in this case it's the value 'world'
        else outKeyVal.set( inObj.get().hello );

    //try changing the 'hello' to 'one' to get the
    //other value

}
```

Follow this [link](../../dev_callbacks/dev_callbacks) for more information on Callbacks
