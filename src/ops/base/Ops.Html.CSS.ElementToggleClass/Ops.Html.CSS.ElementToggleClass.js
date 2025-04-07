const
    inEle = op.inObject("HTML Element", null, "element"),
    inClassName = op.inString("Classname"),
    inToggle = op.inTrigger("Update");

inToggle.onTriggered = update;

function update()
{
    let ele = inEle.get();
    let cn = inClassName.get();

    if (!cn || !ele || !ele.classList) return;

    ele.classList.toggle(cn);
}
