const
    inEle = op.inObject("Element"),
    inAriaHidden = op.inBool("aria hidden", false),
    outEle = op.outObject("HTML Element");

op.setPortGroup("Element", [inEle]);

inAriaHidden.onChange = update;
let ele = null;

inEle.onChange =
    outEle.onLinkChanged =
    inEle.onLinkChanged = removeProp;

function removeProp()
{
    if (ele) ele.removeAttribute("aria-hidden");
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
    }

    outEle.setRef(inEle.get());
}
