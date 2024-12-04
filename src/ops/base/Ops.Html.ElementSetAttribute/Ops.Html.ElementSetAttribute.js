const
    inEle = op.inObject("Element"),
    inAttrName = op.inString("Attribute"),
    inValue = op.inString("Value"),
    inActive = op.inBool("Active", true),
    outEle = op.outObject("HTML Element");

op.setPortGroup("Element", [inEle]);
op.setPortGroup("Attributes", [inAttrName, inValue]);

inAttrName.onChange = updateProperty;
inValue.onChange = update;
let ele = null;
let oldName = "";

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
    if (ele)ele.removeAttribute(inAttrName.get());
    ele = null;
    update();
}

function updateProperty()
{
    update();
    op.setUiAttrib({ "extendTitle": inAttrName.get() + "" });
}

function update()
{
    if (!inActive.get()) return;
    if (inAttrName.get() == "") return;

    if (inEle.get())
        ele = inEle.get();

    if (ele && ele.setAttribute)
    {
        op.setUiError("errd", null);

        if (inAttrName.get() != oldName)
        {
            ele.removeAttribute(oldName);
            oldName = inAttrName.get();
        }

        const str = inValue.get();

        try
        {
            ele.setAttribute(inAttrName.get(), str);
        }
        catch (e)
        {
            if (e.message)op.setUiError("errd", e.message);
        }
    }

    outEle.setRef(inEle.get());
}
