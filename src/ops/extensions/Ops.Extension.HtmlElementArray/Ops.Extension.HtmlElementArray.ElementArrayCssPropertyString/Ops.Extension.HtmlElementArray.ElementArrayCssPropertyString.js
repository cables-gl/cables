const
    inEle = op.inObject("Element"),
    inUpdate = op.inTriggerButton("Update"),
    inProperty = op.inString("Property"),
    inValue = op.inString("Value"),
    inValueSuffix = op.inString("Value Suffix", "px"),

    outEle = op.outObject("HTML Element");

op.setPortGroup("Element", [inEle]);
op.setPortGroup("Attributes", [inProperty, inValue, inValueSuffix]);

inProperty.onChange = updateProperty;
// inValue.onChange = update;
// inValueSuffix.onChange = update;
let ele = null;

// inEle.onChange =update;
inUpdate.onTriggered = update;

inEle.onLinkChanged = function ()
{
    // if (ele && ele.style)
    // {
    //     ele.style[inProperty.get()] = "initial";
    // }
    // update();
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
            // if (ele.style[inProperty.get()] != str)
            ele.style[inProperty.get()] = str;
        }
        catch (e)
        {
            op.error(e);
        }
    }

    outEle.set(inEle.get());
}
