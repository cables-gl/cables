
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
        duration.get()+CABLES.now()/1000.0, inValue.get(),triggerFinished);

}

function triggerFinished()
{
    finished.trigger();    
}


exe.onTriggered=function()
{
    var t=CABLES.now()/1000;
    var v=anim.getValue(t);

    result.set(v);
};

