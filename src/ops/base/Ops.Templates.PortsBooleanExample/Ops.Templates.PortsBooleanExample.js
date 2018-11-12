//strict mode allows us to write cleaner code
"use strict";

//Create a input port of the type Boolean
const inBoolean = op.inValueBool("Boolean in");

//Create a output port of the type value
const outBoolean = op.outValueBool("Boolean out");

//when input port changes call the function 'update'
inBoolean.onChange = update;

//this function runs every time the input port changes
function update()
{
    //set the ouput port to the value of the input port
    outBoolean.set(inBoolean.get());
}
