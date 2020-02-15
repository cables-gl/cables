//Create a input port of the type String
const inString  = op.inString("String in", "default string");
//Create a output port of the type String
const outString = op.outString("String out");

//when input port changes call the function 'update'
inString.onChange = update;

//this function runs every time the input port changes
function update()
{
    //set the output to the input string
    outString.set(inString.get());
}