
var accX=op.outValue("Acceleration X");
var accY=op.outValue("Acceleration Y");
var accZ=op.outValue("Acceleration Z");

var lastTime=0;
var lastTimeAcc=0;

var obj={};

registerEvents();

var lastX=0;
var lastY=0;
var lastZ=0;

function moved(event)
{
    if(CABLES.now()-lastTimeAcc>30)
    {
        lastTimeAcc=CABLES.now();

        var deltaX=lastX-event.accelerationIncludingGravity.x;
        var deltaY=lastY-event.accelerationIncludingGravity.y;
        var deltaZ=lastZ-event.accelerationIncludingGravity.z;

        accX.set(Math.abs(deltaX));
        accY.set(Math.abs(deltaY));
        accZ.set(Math.abs(deltaZ));


        lastX=event.accelerationIncludingGravity.x;
        lastY=event.accelerationIncludingGravity.y;
        lastZ=event.accelerationIncludingGravity.z;

    }
}


function registerEvents()
{
    window.addEventListener("devicemotion", moved,true);
}

op.onDelete=function()
{
    window.removeEventListener("devicemotion", moved);
}