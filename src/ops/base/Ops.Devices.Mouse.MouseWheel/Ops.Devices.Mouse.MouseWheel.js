
op.name='mousewheel';

var valIn=op.inValue("Value",0);

var mul=op.inValue("Multiply",1);

var min=op.inValue("min",-100);
var max=op.inValue("max", 100);

var smooth=op.inValueBool("smooth");
var smoothSpeed=op.inValue("delay",0.3);
var preventScroll=op.inValueBool("prevent scroll");
var flip=op.inValueBool("Flip Direction");
var reset=op.inFunction("Reset");

var absVal=op.outValue("absolute value",0);
var delta=op.outValue("delta",0);

var cgl=op.patch.cgl;
cgl.canvas.addEventListener('wheel', onMouseWheel);

var value=0;

var anim=new CABLES.TL.Anim();
anim.defaultEasing=CABLES.TL.EASING_EXPO_OUT;

var startTime=Date.now()/1000.0;
var v=0;

anim.clear();
anim.setValue(Date.now()/1000.0-startTime,absVal.get());
var dir=1;

reset.onTriggered=function()
{
    anim.clear();
    anim.setValue(Date.now()/1000.0-startTime,valIn.get());

    absVal.set(valIn.get());
};

valIn.onChange=function()
{
    v=valIn.get();

    checkValue();
    
    absVal.set( v );
    
    anim.clear();
    anim.setValue(Date.now()/1000.0-startTime,absVal.get());

};

function updateSmooth()
{
    var v=anim.getValue( Date.now()/1000.0-startTime );
    
    absVal.set( v );
}

smooth.onChange=function()
{
    if(smooth.get()) smoothTimer = setInterval(updateSmooth, 15);
        else clearTimeout(smoothTimer);
};

var isMac = navigator.platform.toUpperCase().indexOf('MAC')>=0;

function wheelDistance(evt)
{


    if (!evt) evt=event;
    var w=evt.wheelDelta||evt.deltaY||0, d=evt.detail;

    var ret=0;

    if (d)
    {
        if (w) ret= w/d/40*d>0?1:-1; // Opera
            else ret= -d/3;              // Firefox;         TODO: do not /3 for OS X
    }
    else 
    {
        if(isMac)ret= w;
            else ret= w/120;             // IE/Safari/Chrome TODO: /3 for Chrome OS X
    }

    if(!isMac)ret*=6;
    if(ret!=ret)ret=0;
    
    
    return ret*mul.get();
}

function checkValue()
{
    if(v<min.get())v=min.get();
    if(v>max.get())v=max.get();
}

flip.onChange=function()
{
    if(flip.get())dir=-1;
        else dir=1;
};

var vOut=0;

function onMouseWheel(e)
{
    var d= wheelDistance(e)*(0.05*dir);

    delta.set(0);
    delta.set(d);
    
    v-=d;
    

    // vOut=v+valIn.get();
    // v+=valIn.get();

    checkValue();

    
    if( !smooth.get() )
    {
        absVal.set(v);
    }
    else
    {
        anim.clear();
        anim.setValue(Date.now()/1000.0-startTime,absVal.get());
        anim.setValue(Date.now()/1000.0-startTime+smoothSpeed.get(),v);
    }
    
    if(preventScroll.get()) e.preventDefault();
}
