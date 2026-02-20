const
    inEle = op.inObject("Element"),
    inProperty = op.inString("Property"),
    inVarName = op.inString("Variable name"),
    inActive = op.inBool("Active", true),
    outEle = op.outObject("HTML Element");

op.setPortGroup("Element", [inEle]);
op.setPortGroup("Attributes", [inProperty, inVarName]);

inProperty.onChange = updateProperty;
inVarName.onChange = update;
let ele = null;

inEle.onChange = () =>
{
    // if (inEle.get() == ele) return; //needs to be updated..........
    removeProp();
};

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
        const str = inVarName.get();
        try
        {
            ele.style[inProperty.get()] = "var(--" + str + ")";
        }
        catch (e)
        {
            op.logError(e);
        }
    }

    outEle.setRef(inEle.get());
}
