const
    inEle = op.inObject("Element", null, "element"),
    inX = op.inFloat("inX"),
    inY = op.inFloat("inY"),

    outEle = op.outObject("Element out"),
    outX = op.outNumber("X"),
    outY = op.outNumber("Y");

inX.setUiAttribs({ "hidePort": true });
inY.setUiAttribs({ "hidePort": true });

let elmnt = null;
let pos1, pos2, pos3, pos4;
inEle.onChange = () =>
{
    elmnt = inEle.get();
    if (!elmnt) return;
    const rr = elmnt.getBoundingClientRect();

    elmnt.style.top = (inY.get() - rr.height / 2) + "px";
    elmnt.style.left = (inX.get() - rr.width / 2) + "px";
    outX.set(inX.get());
    outY.set(inY.get());

    elmnt.onmousedown = dragMouseDown;
};

inX.onChange = inY.onChange = () =>
{
    inX.onChange = null;
    inY.onChange = null;
};

function dragMouseDown(e)
{
    e.preventDefault();

    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;

    document.onmousemove = elementDrag;
}

function elementDrag(e)
{
    e.preventDefault();

    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;

    const r = op.patch.cgl.canvas.getBoundingClientRect();

    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";

    ///

    const rr = elmnt.getBoundingClientRect();

    outX.set(rr.left + rr.width / 2 - r.left);
    outY.set(rr.top + rr.height / 2 - r.top);
    inX.set(outX.get());
    inY.set(outY.get());
    outEle.setRef(elmnt);
}

function closeDragElement()
{
    document.onmouseup = null;
    document.onmousemove = null;
}
