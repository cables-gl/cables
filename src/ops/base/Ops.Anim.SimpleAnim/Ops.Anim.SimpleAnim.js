
var exe=op.addInPort(new CABLES.Port(op,"exe",CABLES.OP_PORT_TYPE_FUNCTION));

var reset=op.inFunctionButton("reset");
var rewind=op.inFunctionButton("rewind");

var inStart=op.addInPort(new CABLES.Port(op,"start"));
var inEnd=op.addInPort(new CABLES.Port(op,"end"));
var duration=op.addInPort(new CABLES.Port(op,"duration"));

var loop=op.addInPort(new CABLES.Port(op,"loop",CABLES.OP_PORT_TYPE_VALUE,{display:"bool"}));
var waitForReset=op.inValueBool("Wait for Reset",true);

var next=op.outTrigger("Next");
var result=op.addOutPort(new CABLES.Port(op,"result"));
var finished=op.addOutPort(new CABLES.Port(op,"finished",CABLES.OP_PORT_TYPE_VALUE));
var finishedTrigger=op.outTrigger("Finished Trigger");

var resetted=false;



var anim=new CABLES.TL.Anim();

anim.createPort(op,"easing",init);

var currentEasing=-1;
function init()
{
    if(anim.keys.length!=3)
    {
        anim.setValue(0,0);
        anim.setValue(1,0);
        anim.setValue(2,0);
    }
    
    anim.keys[0].time=CABLES.now()/1000.0;
    anim.keys[0].value=inStart.get();
    if(anim.defaultEasing!=currentEasing) anim.keys[0].setEasing(anim.defaultEasing);

    anim.keys[1].time=duration.get()+CABLES.now()/1000.0;
    anim.keys[1].value=inEnd.get();
    
    if(anim.defaultEasing!=currentEasing) anim.keys[1].setEasing(anim.defaultEasing);

    anim.loop=loop.get();
    if(anim.loop)
    {
        anim.keys[2].time=(2.0*duration.get())+CABLES.now()/1000.0;
        anim.keys[2].value=inStart.get();
        if(anim.defaultEasing!=currentEasing) anim.keys[2].setEasing(anim.defaultEasing);
    }
    else
    {
        anim.keys[2].time=anim.keys[1].time;
        anim.keys[2].value=anim.keys[1].value;
        if(anim.defaultEasing!=currentEasing) anim.keys[2].setEasing(anim.defaultEasing);
    }
    finished.set(false);

    currentEasing=anim.defaultEasing;
}

loop.onValueChanged=init;
reset.onTriggered=function()
{
    resetted=true;
    init();
};

rewind.onTriggered=function()
{
    anim.keys[0].time=CABLES.now()/1000.0;
    anim.keys[0].value=inStart.get();

    anim.keys[1].time=CABLES.now()/1000.0;
    anim.keys[1].value=inStart.get();

    anim.keys[2].time=CABLES.now()/1000.0;
    anim.keys[2].value=inStart.get();
    
    result.set(inStart.get());
};

exe.onTriggered=function()
{
    if(waitForReset.get() && !resetted) 
    {
        result.set(inStart.get());
        return;
    }
    var t=CABLES.now()/1000;
    var v=anim.getValue(t);
    result.set(v);
    if(anim.hasEnded(t))
    {
        if(!finished.get()) finishedTrigger.trigger();
        finished.set(true);
    }
    
    next.trigger();
};

inStart.set(0.0);
inEnd.set(1.0);
duration.set(0.5);
init();

duration.onChange=init;
