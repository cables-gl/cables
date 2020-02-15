//Create a input port of the type value
const inObj  = op.inObject("Object in");

//Create a output port of the type value
const outKeyVal=op.outObject("Object Out");

//when input port changes call the function 'update'
inObj.onChange = update;

//this function runs every time the input port changes
function update()
{
    outKeyVal.set(inObj.get());
};

