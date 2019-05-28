/*
Click the 'ParseObject' op that's connected to
this one. Then click 'Edit' next to JSON String
to see the following code

{
    "hello" : "world",
    "one" : "2"
}
*/

//Create a input port of the type value
const inObj  = op.inObject("Object in");
//Create a output port of the type value
const outKeyVal=op.outValueString("Test");

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

