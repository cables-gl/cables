op.name="DeviceVibrate";

var inVibrate=op.inTriggerButton("Vibrate");
var outSupported=op.outValue("Supported");

navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || 
navigator.mozVibrate || navigator.msVibrate;
 
if (navigator.vibrate) outSupported.set(true);
    else outSupported.set(false);
    
inVibrate.onTriggered=function()
{
    if(navigator.vibrate)
    {
        navigator.vibrate(1500);
    }
    
};