const
    inUpdate = op.inTriggerButton("Update"),
    inEle = op.inObject("Element", null, "element"),
    inScrollTop = op.inTriggerButton("Scroll to top"),

    next = op.outTrigger("Next"),
    sleft = op.addOutPort(new CABLES.Port(op, "left")),
    stop = op.addOutPort(new CABLES.Port(op, "top")),
    scrollPercentageX = op.outNumber("Percentage X"),
    scrollPercentageY = op.outNumber("Percentage Y");

let el = null;
let oldEle = null;

op.toWorkPortsNeedToBeLinked(inUpdate);

updateScroll();

inUpdate.onTriggered = () =>
{
    updateScroll(true);
};

inEle.onChange = () =>
{
    if (oldEle)oldEle.removeEventListener("scroll", updateScroll);

    oldEle = inEle.get();
    if (oldEle)
        oldEle.addEventListener("scroll", updateScroll);
};

function updateScroll(trigNext = false)
{
    el = inEle.get();

    if (!el)
    {
        // el = (window.pageXOffset !== undefined) ? window.pageXOffset : (document.documentElement || document.body.parentNode || document.body);
        el = document.documentElement;
        if (document.body.scrollTop > 0)el = document.body;
        // if(document.documentElement.scrollTop>0)el=document.documentElement;
    }

    if (!el) return console.warn("[scrollposition] no ele scrollpos!");
    sleft.set(el.scrollLeft);
    stop.set(el.scrollTop);

    const rCanv = op.patch.cgl.canvas.getBoundingClientRect();

    let py = el.scrollTop / (el.scrollHeight - rCanv.height);
    let px = el.scrollLeft / (el.scrollWidth - rCanv.width);
    scrollPercentageY.set(py || 0);
    scrollPercentageX.set(px || 0);
    if (trigNext === true) next.trigger();
}

inScrollTop.onTriggered = () =>
{
    if (el)el.scrollTo({ "top": Math.random() * 2, "behaviour": "smooth" });
    updateScroll();
};
