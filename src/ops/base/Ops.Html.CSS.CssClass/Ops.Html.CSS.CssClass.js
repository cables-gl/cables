const
    inStr = op.inStringEditor("CSS", ""),
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
    inStr.onChange = () =>
    {
        const content = inStr.get() || "";
        styleEle.textContent = "." + inClassName.get() + " {\n" + content + "\n}\n";
    };

op.onDelete = () =>
{
    styleEle.remove();
};
