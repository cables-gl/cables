op.name="FullscreenMode";

var doRequest=op.inFunction("Request Fullscreen");
var doExit=op.inFunction("Exit Fullscreen");
var isFullscreen=op.outValueBool("Is Fullscreen");

function setState()
{
    var isFull=(!window.screenTop && !window.screenY);
    isFullscreen.set(isFull);
}

doRequest.onTriggered=function()
{
    var elem=op.patch.cgl.canvas.parentElement;

    if (elem.requestFullScreen) elem.requestFullScreen();
    else if (elem.mozRequestFullScreen) elem.mozRequestFullScreen();
    else if (elem.webkitRequestFullScreen)elem.webkitRequestFullScreen();
    else if (elem.msRequestFullScreen)elem.msRequestFullScreen();

    setTimeout(setState,100);
    setTimeout(setState,500);
    setTimeout(setState,1000);
};

doExit.onTriggered=function()
{
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    else if (document.msExitFullscreen)document.msExitFullscreen();

    setTimeout(setState,100);
    setTimeout(setState,500);
    setTimeout(setState,1000);
};