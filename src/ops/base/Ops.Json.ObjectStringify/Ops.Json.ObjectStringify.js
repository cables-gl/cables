let inObj = op.inObject("Object");
let inBeautify = op.inBool("beautify");
let outString = op.outValue("Result");

inBeautify.onChange = update;
inObj.onChange = update;

function update()
{
    if (inBeautify.get())outString.set(JSON.stringify(inObj.get()));
    else outString.set(JSON.stringify(inObj.get(), false, 4));
}
