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



function init()
{
    anim.clear();
    anim.setValue(CABLES.now()/1000.0, inStart.get());
    anim.setValue(parseFloat(duration.get())+CABLES.now()/1000.0, inEnd.get());
    finished.set(false);
    anim.loop=loop.get();
    
    if(anim.loop)
        anim.setValue(parseFloat(2.0*duration.get())+CABLES.now()/1000.0, inStart.get());

}

loop.onValueChanged=init;
reset.onTriggered=function()
{
    resetted=true;
    init();
};

rewind.onTriggered=function()
{
    anim.clear();
    anim.setValue(CABLES.now()/1000,inStart.get());
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

// inStart.onValueChange(init);
// inEnd.onValueChange(init);
duration.onChange=init;
// easing.onValueChange(init);
