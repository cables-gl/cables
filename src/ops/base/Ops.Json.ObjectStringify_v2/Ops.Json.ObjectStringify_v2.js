const
    inObj = op.inObject("Object"),
    inBeautify = op.inValueBool("Beautify", true),
    outString = op.outString("Result"),
    outError = op.outBoolNum("Error");

inBeautify.onChange = inObj.onChange = update;

function update()
{
    const obj = inObj.get();

    if (obj && obj.constructor && (obj.constructor.name == "String") || CABLES.isNumeric(obj) || Array.isArray(obj))
    {
        op.setUiError("notobj", "The connected is not of type object! ", 1);
    }
    else op.setUiError("notobj", null);

    try
    {
        if (!inBeautify.get())outString.set(JSON.stringify(obj));
        else outString.set(JSON.stringify(obj, false, 4));
        outError.set(0);
    }
    catch (e)
    {
        op.error(e);
        outString.set("error");
        outError.set(1);
    }
}
