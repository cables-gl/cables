var inUpdate=op.inTriggerButton("Update");
var outResult=op.outValue("Fully Visible");
var outResultPartly=op.outValue("Partly Visible");

inUpdate.onTriggered=update;

window.addEventListener('DOMContentLoaded load', update);
window.addEventListener('resize', update);
window.addEventListener('scroll', update);

// from: https://stackoverflow.com/questions/19669786/check-if-element-is-visible-in-dom

function pointInViewport(x,y)
{
    return (
        y >= 0 &&
        x >= 0 &&
        y <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
        x <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
    );
}

function elementInViewport(el)
{
    var rect = el.getBoundingClientRect();

    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
        rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
    );
}

function elementInViewportPartly(el)
{
    var rect = el.getBoundingClientRect();
    
    return (
        pointInViewport( rect.left,rect.top ) ||
        pointInViewport( rect.left,rect.bottom ) ||
        pointInViewport( rect.right,rect.top ) ||
        pointInViewport( rect.right,rect.bottom )
        );
}

function update()
{
    var visible=elementInViewport(op.patch.cgl.canvas);
    var visiblePartly=elementInViewportPartly(op.patch.cgl.canvas);
    
    outResultPartly.set(visiblePartly);
    outResult.set(visible);
}

update();