//Create a input port of the type value
const inVal   = op.inValue("Value in");

//Create a output port of the type value
const outResult  = op.outValue("Value out");

//when input port changes call the function 'update'
inVal.onChange = update;

//this function runs every time the input port changes
function update()
{
    //set the ouput port to the value of the input port
    //parse the input for a float, if it isn't a float set to Nan
    outResult.set(parseFloat( inVal.get()));
}