//Create a input port of the type value
const inVal = op.inFloat("Number in ",0);

//Create a output port of the type value
const outResult  = op.outNumber("Value out");

//when input port changes call the function 'update'
inVal.onChange = update;

//this function runs every time the input port changes
function update()
{
    //set the ouput port to the value of the input port
    outResult.set(inVal.get());
}