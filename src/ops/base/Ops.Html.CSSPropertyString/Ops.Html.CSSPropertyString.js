const
    inEle = op.inObject("Element"),
    inProperty = op.inString("Property"),
    inValue = op.inString("Value"),
    inActive = op.inBool("Active", true),
    outEle = op.outObject("HTML Element");

op.setPortGroup("Element", [inEle]);
op.setPortGroup("Attributes", [inProperty, inValue]);

inProperty.onChange = updateProperty;
inValue.onChange = update;
let ele = null;

inEle.onChange =
    outEle.onLinkChanged =
    inEle.onLinkChanged = removeProp;

inActive.onChange = () =>
{
    if (!inActive.get()) removeProp();
    else update();
};

function removeProp()
{
    if (ele && ele.style) ele.style[inProperty.get()] = "initial";
    update();
}

function updateProperty()
{
    update();
    op.setUiAttrib({ "extendTitle": inProperty.get() + "" });
}

function update()
{
    if (!inActive.get()) return;

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
            op.logError(e);
        }
    }

    outEle.setRef(inEle.get());
}
