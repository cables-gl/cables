const
    inEle = op.inObject("Element"),
    inAriaLabel = op.inString("aria Label"),
    inAriaLabelBy = op.inString("aria Labeled By"),
    inAriaHidden = op.inBool("aria hidden", false),

    outEle = op.outObject("HTML Element");

op.setPortGroup("Element", [inEle]);
let ele = null;

inAriaLabelBy.onChange =
    inAriaLabel.onChange =
    inAriaHidden.onChange = update;

update();

inEle.onChange =
    outEle.onLinkChanged =
    inEle.onLinkChanged = removeProp;

function removeProp()
{
    if (ele) ele.removeAttribute("aria-hidden");
    update();
}

function update()
{
    ele = inEle.get();
    if (ele && ele.style)
    {
        if (inAriaLabel) ele.setAttribute("aria-label", inAriaLabel.get());
        else ele.removeAttribute("aria-label");

        if (inAriaLabelBy.get()) ele.setAttribute("aria-labelledby", inAriaLabelBy.get());
        else ele.removeAttribute("aria-labelledby");

        if (inAriaHidden.get())
        {
            ele.setAttribute("aria-hidden", true);
            op.setUiAttrib({ "extendTitle": inAriaLabel.get() + " hidden" });
        }
        else
        {
            ele.removeAttribute("aria-hidden");
            op.setUiAttrib({ "extendTitle": inAriaLabel.get() });
        }
        ele.setAttribute("tabindex", 0);
    }

    outEle.setRef(inEle.get());
}
