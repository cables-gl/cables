const
    disableScaleWeb=op.inValueBool("Disable Scaling",true),
    disableDefault=op.inValueBool("Disable Scroll",true),
    hdpi=op.inValueBool("HDPI Coordinates",false),
    active=op.inValueBool("Active",true),

    outTouched=op.outValue("Touched"),
    numFingers=op.outValue("Fingers"),

    f1x=op.outValue("Finger 1 X"),
    f1y=op.outValue("Finger 1 Y"),
    f1f=op.outValue("Finger 1 Force"),

    f2x=op.outValue("Finger 2 X"),
    f2y=op.outValue("Finger 2 Y"),
    area=op.inSwitch("Area",['Canvas','Document'],'Canvas'),

    outEvents=op.outArray("Events"),
    normalize=op.inValueBool("Normalize Coordinates"),
    flipY=op.inValueBool("Flip Y"),
    outTouchStart=op.outTrigger("Touch Start"),
    outTouchEnd=op.outTrigger("Touch End");


area.onChange=updateArea;

function setPos(event)
{
    if(event.touches && event.touches.length>0)
    {
        var rect = event.target.getBoundingClientRect();
        var x = event.touches[0].clientX - event.touches[0].target.offsetLeft;
        var y = event.touches[0].clientY - event.touches[0].target.offsetTop;

        if(flipY.get()) y=rect.height-y;

        if(hdpi.get())
        {
            x*=(op.patch.cgl.pixelDensity||1);
            y*=(op.patch.cgl.pixelDensity||1);
        }

        if(normalize.get())
        {
            x=(x/rect.width*2.0-1.0);
            y=(y/rect.height*2.0-1.0);
        }

        f1x.set(x);
        f1y.set(y);

        if(event.touches[0].force)f1f.set(event.touches[0].force);
    }

    if(event.touches && event.touches.length>1)
    {
        var rect = event.target.getBoundingClientRect();
        var x = event.touches[1].clientX - event.touches[1].target.offsetLeft;
        var y = event.touches[1].clientY - event.touches[1].target.offsetTop;

        if(hdpi.get())
        {
            x*=(op.patch.cgl.pixelDensity||1);
            y*=(op.patch.cgl.pixelDensity||1);
        }

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
    f1f.set(0);
    setPos(event);

    numFingers.set(event.touches.length);
    outTouchEnd.trigger();
};

var ontouchmove=function(event)
{
    setPos(event);
    numFingers.set(event.touches.length);
    if(disableDefault.get() || (disableScaleWeb.get() && event.scale !== 1))
    {
        event.preventDefault();
    }
};


var cgl=op.patch.cgl;
var listenerElement=null;
function addListeners()
{
    listenerElement.addEventListener('touchmove', ontouchmove);
    listenerElement.addEventListener('touchstart', ontouchstart);
    listenerElement.addEventListener('touchend', ontouchend);

    console.log("added touchscreen listeners",listenerElement);

}


function updateArea()
{
    removeListeners();

    if(area.get()=='Document') listenerElement = document;
    else listenerElement = cgl.canvas;

    if(active.get()) addListeners();

}

function removeListeners()
{
    if(listenerElement)
    {
        listenerElement.removeEventListener('touchmove', ontouchmove);
        listenerElement.removeEventListener('touchstart', ontouchstart);
        listenerElement.removeEventListener('touchend', ontouchend);
    }
    console.log("removed touchscreen listeners");
    listenerElement=null;

}

active.onChange=function()
{
    updateArea();

    console.log('active',active.get());
};

updateArea();

