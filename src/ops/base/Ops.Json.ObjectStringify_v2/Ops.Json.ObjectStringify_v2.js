const
    inObj = op.inObject("Object"),
    inBeautify = op.inBool("Beautify"),
    outString = op.outString("Result");

inBeautify.onChange = inObj.onChange = update;

function update()
{
    if (!inBeautify.get())outString.set(JSON.stringify(inObj.get()));
    else outString.set(JSON.stringify(inObj.get(), false, 4));
}
