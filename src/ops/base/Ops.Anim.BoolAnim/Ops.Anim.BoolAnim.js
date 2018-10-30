var exe=op.addInPort(new CABLES.Port(op,"exe",CABLES.OP_PORT_TYPE_FUNCTION));
var bool=op.addInPort(new CABLES.Port(op,"bool",CABLES.OP_PORT_TYPE_VALUE,{display:'bool'}));
var valueFalse=op.addInPort(new CABLES.Port(op,"value false",CABLES.OP_PORT_TYPE_VALUE));
var valueTrue=op.addInPort(new CABLES.Port(op,"value true",CABLES.OP_PORT_TYPE_VALUE));
var duration=op.addInPort(new CABLES.Port(op,"duration",CABLES.OP_PORT_TYPE_VALUE));


var next=op.addOutPort(new CABLES.Port(op,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));
var value=op.addOutPort(new CABLES.Port(op,"value",CABLES.OP_PORT_TYPE_VALUE));
var finished=op.addOutPort(new CABLES.Port(op,"finished",CABLES.OP_PORT_TYPE_VALUE));
var finishedTrigger=op.outTrigger("Finished Trigger");

valueFalse.set(0);
valueTrue.set(1);
duration.set(0.3);

var anim=new CABLES.TL.Anim();
anim.createPort(op,"easing");

var startTime=CABLES.now();

function setAnim()
{
    finished.set(false);
    var now=(CABLES.now()-startTime)/1000;
    var oldValue=anim.getValue(now);
    anim.clear();

    anim.setValue(now,oldValue);

    if(!bool.get()) anim.setValue(now+duration.get(),valueFalse.get());
        else anim.setValue(now+duration.get(),valueTrue.get());
}

bool.onValueChanged=setAnim;
valueFalse.onValueChanged=setAnim;
valueTrue.onValueChanged=setAnim;
duration.onValueChanged=setAnim;


exe.onTriggered=function()
{
    var t=(CABLES.now()-startTime)/1000;
    value.set(anim.getValue(t));
    
    if(anim.hasEnded(t))
    {
        if(!finished.get()) finishedTrigger.trigger();
        finished.set(true);
    }

    next.trigger();
};

setAnim();


