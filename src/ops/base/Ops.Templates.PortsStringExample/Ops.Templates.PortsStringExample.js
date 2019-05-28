//Create a input port of the type String
const inString  = op.inValueString("String in");
//Create a output port of the type String
const outString = op.outValueString("String out");

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