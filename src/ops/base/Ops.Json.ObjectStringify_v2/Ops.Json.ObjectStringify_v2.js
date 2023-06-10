const
    inObj = op.inObject("Object"),
    inBeautify = op.inValueBool("Beautify", true),
    outString = op.outString("Result"),
    outError = op.outBoolNum("Error");

inBeautify.onChange = inObj.onChange = update;

function update()
{
    try
    {
        if (!inBeautify.get())outString.set(JSON.stringify(inObj.get()));
        else outString.set(JSON.stringify(inObj.get(), false, 4));
        outError.set(0);
    }
    catch (e)
    {
        op.error(e);
        outString.set("error");
        outError.set(1);
    }
}
