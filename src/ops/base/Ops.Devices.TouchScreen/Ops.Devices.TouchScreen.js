op.name="TouchScreen";


var outTouched=op.outValue("Touched");

var numFingers=op.outValue("Fingers");

var f1y=op.outValue("Finger 1 X");
var f1x=op.outValue("Finger 1 Y");

var f2y=op.outValue("Finger 2 X");
var f2x=op.outValue("Finger 2 Y");

var outEvents=op.outArray("Events");

function setPos(event)
{
    if(event.touches && event.touches.length>0) 
    {
        f1x.set(event.touches[0].clientX);
        f1y.set(event.touches[0].clientY);
    }

    if(event.touches && event.touches.length>1) 
    {
        f2x.set(event.touches[1].clientX);
        f2y.set(event.touches[1].clientY);
    }
    outEvents.set(event.touches);

}

var ontouchstart=function(event)
{
    outTouched.set(true);
    setPos(event);
    numFingers.set(event.touches.length);
};

var ontouchend=function(event)
{
    outTouched.set(false);
    setPos(event);

    numFingers.set(event.touches.length);

};

var ontouchmove=function(event)
{
    setPos(event);
    numFingers.set(event.touches.length);
    // if(event.touches && event.touches.length>0) onmousemove(event.touches[0]);
};


var cgl=op.patch.cgl;
cgl.canvas.addEventListener('touchmove', ontouchmove);
cgl.canvas.addEventListener('touchstart', ontouchstart);
cgl.canvas.addEventListener('touchend', ontouchend);

