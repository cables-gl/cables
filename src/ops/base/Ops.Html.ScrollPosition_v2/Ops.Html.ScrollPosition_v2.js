const
    inEle = op.inObject("Element", null, "element"),
    sleft = op.addOutPort(new CABLES.Port(op, "left")),
    stop = op.addOutPort(new CABLES.Port(op, "top")),
    scrollPercentageX = op.outNumber("Percentage X"),
    scrollPercentageY = op.outNumber("Percentage Y");

updateScroll();

let oldEle = null;

inEle.onChange = () =>
{
    if (oldEle)oldEle.removeEventListener("scroll", updateScroll);

    oldEle = inEle.get();
    if (oldEle)
        oldEle.addEventListener("scroll", updateScroll);
};

function updateScroll()
{
    let el = inEle.get();

    if (!el)
    {
        el = (window.pageXOffset !== undefined) ? window.pageXOffset : (document.documentElement || document.body.parentNode || document.body);
    }

    if (!el) return;
    sleft.set(el.scrollLeft);
    stop.set(el.scrollTop);

    const rCanv = op.patch.cgl.canvas.getBoundingClientRect();

    let py = el.scrollTop / (el.scrollHeight - rCanv.height);
    let px = el.scrollLeft / (el.scrollWidth - rCanv.width);
    scrollPercentageY.set(py);
    scrollPercentageX.set(px);
}
