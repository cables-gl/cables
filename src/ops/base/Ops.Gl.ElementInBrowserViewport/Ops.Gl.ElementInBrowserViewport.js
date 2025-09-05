const
    inUpdate = op.inTriggerButton("Update"),
    inEle = op.inObject("Element", null, "element"),
    outNext = op.outTrigger("Next"),
    outResult = op.outBoolNum("Fully Visible"),
    outResultPartly = op.outBoolNum("Partly Visible");

inUpdate.onTriggered = update;

// window.addEventListener("DOMContentLoaded load", update);
// window.addEventListener("resize", update);
// window.addEventListener("scroll", update);

// from: https://stackoverflow.com/questions/19669786/check-if-element-is-visible-in-dom

function pointInViewport(x, y)
{
    return (
        y >= 0 &&
        x >= 0 &&
        y <= (window.innerHeight || document.documentElement.clientHeight) &&
        x <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

function elementInViewport(el)
{
    if (!el.getBoundingClientRect) return;

    let rect = el.getBoundingClientRect();

    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

function elementInViewportPartly(el)
{
    if (!el.getBoundingClientRect) return;
    let rect = el.getBoundingClientRect();

    return (
        rect.top < 0 && rect.bottom > 0 ||
        rect.left < 0 && rect.right > 0 ||

        pointInViewport(rect.left, rect.top) ||
        pointInViewport(rect.left, rect.bottom) ||
        pointInViewport(rect.right, rect.top) ||
        pointInViewport(rect.right, rect.bottom)
    );
}

function update()
{
    let visible = elementInViewport(inEle.get() || op.patch.cgl.canvas);
    let visiblePartly = elementInViewportPartly(inEle.get() || op.patch.cgl.canvas);

    outResultPartly.set(visiblePartly);
    outResult.set(visible);
    outNext.trigger();
}

// update();
