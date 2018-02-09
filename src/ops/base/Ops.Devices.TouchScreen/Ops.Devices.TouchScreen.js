op.name="TouchScreen";


var disableScaleWeb=op.inValueBool("Disable Scaling",true);

var outTouched=op.outValue("Touched");

var numFingers=op.outValue("Fingers");

var f1x=op.outValue("Finger 1 X");
var f1y=op.outValue("Finger 1 Y");

var f2x=op.outValue("Finger 2 X");
var f2y=op.outValue("Finger 2 Y");

var outEvents=op.outArray("Events");

var outTouchStart=op.outFunction("Touch Start");
var outTouchEnd=op.outFunction("Touch End");



function setPos(event)
{
    if(event.touches && event.touches.length>0) 
    {
        
        var rect = event.target.getBoundingClientRect();
        var x = event.touches[0].clientX - event.touches[0].target.offsetLeft;
        var y = event.touches[0].clientY - event.touches[0].target.offsetTop;

        f1x.set(x);
        f1y.set(y);
    }

    if(event.touches && event.touches.length>1) 
    {

        var rect = event.target.getBoundingClientRect();
        var x = event.touches[1].clientX - event.touches[1].target.offsetLeft;
        var y = event.touches[1].clientY - event.touches[1].target.offsetTop;

        f2x.set(x);
        f2y.set(y);
    }
    outEvents.set(event.touches);

}

var ontouchstart=function(event)
{
    
    outTouched.set(true);
    setPos(event);
    numFingers.set(event.touches.length);
    outTouchStart.trigger();
};

var ontouchend=function(event)
{
    outTouched.set(false);
    setPos(event);

    numFingers.set(event.touches.length);
    outTouchEnd.trigger();
};

var ontouchmove=function(event)
{
    
    setPos(event);
    numFingers.set(event.touches.length);
    if(disableScaleWeb.get() && event.scale !== 1)
    { 
        event.preventDefault();
    }
    // if(event.touches && event.touches.length>0) onmousemove(event.touches[0]);
};


var cgl=op.patch.cgl;
cgl.canvas.addEventListener('touchmove', ontouchmove);
cgl.canvas.addEventListener('touchstart', ontouchstart);
cgl.canvas.addEventListener('touchend', ontouchend);

