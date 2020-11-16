const
    inEle = op.inObject("Element"),
    inProperty = op.inString("Property"),
    inValue = op.inString("Value"),
    outEle = op.outObject("HTML Element");

op.setPortGroup("Element", [inEle]);
op.setPortGroup("Attributes", [inProperty, inValue]);

inProperty.onChange = updateProperty;
inValue.onChange = update;
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
        const str = inValue.get();
        try
        {
            ele.style[inProperty.get()] = str;
        }
        catch (e)
        {
            op.error(e);
        }
    }

    outEle.set(inEle.get());
}
