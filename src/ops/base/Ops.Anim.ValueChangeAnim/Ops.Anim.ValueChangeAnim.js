op.name="InterpolateValueChange";

var exe=op.addInPort(new Port(op,"exe",OP_PORT_TYPE_FUNCTION));
var inValue=op.inValue("Value");
var duration=op.addInPort(new Port(op,"duration"));
var result=op.addOutPort(new Port(op,"result"));
var finished=op.outFunction("Finished");

var anim=new CABLES.TL.Anim();
anim.createPort(op,"easing",init);


anim.loop=false;

duration.set(0.5);

duration.onChange=init;
inValue.onChange=init;

function init()
{
    anim.clear(CABLES.now()/1000.0);
    // anim.setValue(CABLES.now()/1000.0, inStart.get());
    anim.setValue(
        duration.get()+CABLES.now()/1000.0, inValue.get());
    finished.set(false);
    
    

}


exe.onTriggered=function()
{
    // if(waitForReset.get() && !resetted) 
    // {
    //     result.set(inStart.get());
    //     return;
    // }
    var t=CABLES.now()/1000;
    var v=anim.getValue(t);
    if(anim.hasEnded(t))
    {
        finished.set(true);
    }
    result.set(v);
};

