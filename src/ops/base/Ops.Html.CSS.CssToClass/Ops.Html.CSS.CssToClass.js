const
    inEle = op.inObject("Element", null, "element"),
    inClassName = op.inString("Class Name", "");

op.toWorkPortsNeedsString(inClassName);

const styleEle = op.patch.getDocument().createElement("style");
styleEle.type = "text/css";
styleEle.id = "style" + CABLES.uuid();
styleEle.textContent = attachments.css_spinner;
styleEle.classList.add("cablesEle");

const head = op.patch.getDocument().getElementsByTagName("body")[0];
head.appendChild(styleEle);

inClassName.onChange =
    inEle.onChange = () =>
    {
        const ele = inEle.get();
        if (!ele)
        {
            styleEle.textContent = "";
        }
        else
        {
            styleEle.textContent = "." + inClassName.get() + " {\n" + ele.style.cssText + "\n}\n";
        }
    };

op.onDelete = () =>
{
    styleEle.remove();
};
