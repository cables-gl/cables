const
    inEle = op.inObject("Element"),
    inValue = op.inString("alt"),
    inAriaHidden = op.inBool("aria hidden", false),
    outEle = op.outObject("HTML Element");

op.setPortGroup("Element", [inEle]);

inAriaHidden.onChange =
inValue.onChange = update;
let ele = null;

inEle.onChange =
    outEle.onLinkChanged =
    inEle.onLinkChanged = removeProp;

function removeProp()
{
    if (ele) ele.removeAttribute("aria-hidden");
    if (ele) ele.removeAttribute("alt");
}

function update()
{
    ele = inEle.get();
    if (ele && ele.style)
    {
        if (inAriaHidden.get())
        {
            ele.setAttribute("aria-hidden", true);
            op.setUiAttrib({ "extendTitle": "hidden" });
        }
        else
        {
            ele.removeAttribute("aria-hidden");
            op.setUiAttrib({ "extendTitle": "" });
        }

        if (inValue.get())ele.setAttribute("alt", inValue.get());
        else ele.removeAttribute("alt");
    }

    outEle.setRef(inEle.get());
}
