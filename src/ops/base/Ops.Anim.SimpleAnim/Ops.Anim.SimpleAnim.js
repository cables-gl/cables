op.name="SimpleAnim";

var exe=op.addInPort(new Port(op,"exe",OP_PORT_TYPE_FUNCTION));

var reset=op.inFunctionButton("reset");
var rewind=op.inFunctionButton("rewind");

var inStart=op.addInPort(new Port(op,"start"));
var inEnd=op.addInPort(new Port(op,"end"));
var duration=op.addInPort(new Port(op,"duration"));

var loop=op.addInPort(new Port(op,"loop",OP_PORT_TYPE_VALUE,{display:"bool"}));

var result=op.addOutPort(new Port(op,"result"));
var finished=op.addOutPort(new Port(op,"finished",OP_PORT_TYPE_VALUE));

var resetted=false;
var waitForReset=op.inValueBool("Wait for Reset",false);


var anim=new CABLES.TL.Anim();

anim.createPort(op,"easing",init);

var currentEasing=-1;
function init()
{
    if(anim.keys.length!=3)
    {
        console.log("reinit!");
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

    // anim.clear();
    // anim.setValue(CABLES.now()/1000.0, inStart.get());
    // anim.setValue(parseFloat(duration.get())+CABLES.now()/1000.0, inEnd.get());
    // finished.set(false);
    // anim.loop=loop.get();

    // if(anim.loop)
    //     anim.setValue(parseFloat(2.0*duration.get())+CABLES.now()/1000.0, inStart.get());

}

loop.onValueChanged=init;
reset.onTriggered=function()
{
    resetted=true;
    init();
};

rewind.onTriggered=function()
{
    // anim.clear();
    // anim.setValue(CABLES.now()/1000,inStart.get());
    
    anim.keys[0].time=CABLES.now()/1000.0;
    anim.keys[0].value=inStart.get();

    anim.keys[1].time=CABLES.now()/1000.0;
    anim.keys[1].value=inStart.get();

    anim.keys[2].time=CABLES.now()/1000.0;
    anim.keys[2].value=inStart.get();

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
    if(anim.hasEnded(t))
    {
        finished.set(true);
    }
    result.set(v);
};

inStart.set(0.0);
inEnd.set(1.0);
duration.set(0.5);
init();

duration.onChange=init;
