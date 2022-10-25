let inVibrate = op.inTriggerButton("Vibrate");
let outSupported = op.outBoolNum("Supported");

navigator.vibrate = navigator.vibrate || navigator.webkitVibrate ||
navigator.mozVibrate || navigator.msVibrate;

if (navigator.vibrate) outSupported.set(true);
else outSupported.set(false);

inVibrate.onTriggered = function ()
{
    if (navigator.vibrate)
    {
        navigator.vibrate(1500);
    }
};

if (window.self !== window.top)
{
    op.setUiError("iframe", "DeviceVibrate does not work in an iframe, open the patch without an iframe to get it to work", 1);
    op.warn("DeviceVibrate does not work in an iframe, open the patch without an iframe to get it to work");
}
