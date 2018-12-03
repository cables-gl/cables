const exe=op.addInPort(new CABLES.Port(op,"exe",CABLES.OP_PORT_TYPE_FUNCTION));
const inValue=op.inValue("Value");
const duration=op.addInPort(new CABLES.Port(op,"duration"));
const result=op.addOutPort(new CABLES.Port(op,"result"));
const finished=op.outTrigger("Finished");

const anim=new CABLES.Anim();
anim.createPort(op,"easing",init);

anim.loop=false;
duration.set(0.5);

duration.onChange=init;
inValue.onChange=init;

function init()
{
    anim.clear(CABLES.now()/1000.0);
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