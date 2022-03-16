# Array Ports

This page will explain how to create an input and output port of the type 'Array'<br>

![Button](../img/creating_ports_array_port_color.png) <br>


Click this [link](https://cables.gl/ui/#/project/5b9f692e671e52e512ab3af3) to see an example of all port types and code examples

A Javascript array can contain either simple values, arrays or objects<br>
Arrays are used to store multiple values in a single variable.

E.g. `[1, 2, 3]`, `[[1, 2], [3, 4]]`, `[{"one": 2}, {"three": 4}]`

If you click the op and then the inspect icon ![Button](../img/creating_ports_array_inspect_icon_zoomed.png) you can see the array contents
<br>
![Button](../img/creating_ports_array_inspect_icon.png)

```javascript
// strict mode allows us to write cleaner code
"use strict";

// Create a input port of the type Array
const inArr   = op.inArray("Array in");

// Create a output port of the type Array
const outArray  = op.outArray("Array out");

// cache for errors
const showingError = false;

// when array in changes call the function update
inArr.onChange = update;

function update()
{
    // create an array called 'tempArray' and assign
    // the array coming in to it
    const tempArray = inArr.get();

    // error checking section
    // check if arrays come in correctly on startup
    // if no array comes in just return to avoid errors
    if(!inArr)
    {
        return;
    }
    else
    {
        if(showingError)
        {
            showingError = false;
            //set ui to null if the input is not an array
            op.uiAttr({error:null});
        }
    }
    // set outArray to tempArray
    outArray.set(tempArray);
}
```

Follow this [link](../../dev_callbacks/dev_callbacks) for more information on Callbacks
