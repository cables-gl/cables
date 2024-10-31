const
    inEle = op.inObject("Element"),
    inProperty = op.inString("Property"),
    inValue = op.inFloat("Value"),
    inValueSuffix = op.inString("Value Suffix", "px"),
    outEle = op.outObject("HTML Element", null, "element");

op.setPortGroup("Element", [inEle]);
op.setPortGroup("Attributes", [inProperty, inValue, inValueSuffix]);

inProperty.onChange = updateProperty;
inValue.onChange = update;
inValueSuffix.onChange = update;
let ele = null;

inEle.onChange = inEle.onLinkChanged = function ()
{
    if (ele && ele.style)
    {
        ele.style[inProperty.get()] = "initial";
    }
    update();
};

function updateProperty()
{
    update();
    op.setUiAttrib({ "extendTitle": inProperty.get() + "" });
}

function update()
{
    ele = inEle.get();
    if (ele && ele.style)
    {
        const str = inValue.get() + inValueSuffix.get();
        try
        {
            if (ele.style[inProperty.get()] != str)
                ele.style[inProperty.get()] = str;
        }
        catch (e)
        {
            op.logError(e);
        }
    }
    else
    {
        setTimeout(update, 50);
    }

    outEle.setRef(inEle.get());
}
