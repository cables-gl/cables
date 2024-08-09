const
    doRequest = op.inTriggerButton("Request Fullscreen"),
    doExit = op.inTriggerButton("Exit Fullscreen"),
    inEle = op.inSwitch("Element", ["Canvas", "Document"], "Canvas"),
    isFullscreen = op.outBoolNum("Is Fullscreen");

doExit.onTriggered = exitFs;
doRequest.onTriggered = startFs;

let countStarts = 0;

function setState()
{
    const isFull = (!window.screenTop && !window.screenY);
    isFullscreen.set(isFull);
}

function reqErr(e)
{
    op.warn(e);
}

function startFs()
{
    countStarts++;
    if (countStarts > 30)
    {
        doRequest.onTriggered = null;
        op.setUiAttrib({ "error": "Fullscreen Request shound not triggered that often: op disabled" });
        exitFs();
    }

    let elem = null;
    if (inEle == "Canvas") elem = op.patch.cgl.canvas.parentElement;
    else elem = op.patch.getDocument().documentElement;

    let prom = null;
    if (elem.requestFullScreen) prom = elem.requestFullScreen();
    else if (elem.mozRequestFullScreen) prom = elem.mozRequestFullScreen();
    else if (elem.webkitRequestFullScreen)prom = elem.webkitRequestFullScreen();
    else if (elem.msRequestFullScreen)prom = elem.msRequestFullScreen();

    if (prom && prom.catch)prom.catch(reqErr);

    setTimeout(setState, 100);
    setTimeout(setState, 500);
    setTimeout(setState, 1000);
}

function exitFs()
{
    countStarts--;

    if (op.patch.getDocument().exitFullscreen) op.patch.getDocument().exitFullscreen().catch(reqErr);
    else if (op.patch.getDocument().mozCancelFullScreen) op.patch.getDocument().mozCancelFullScreen().catch(reqErr);
    else if (op.patch.getDocument().webkitExitFullscreen) op.patch.getDocument().webkitExitFullscreen().catch(reqErr);
    else if (op.patch.getDocument().msExitFullscreen)op.patch.getDocument().msExitFullscreen().catch(reqErr);

    setTimeout(setState, 100);
    setTimeout(setState, 500);
    setTimeout(setState, 1000);
}
