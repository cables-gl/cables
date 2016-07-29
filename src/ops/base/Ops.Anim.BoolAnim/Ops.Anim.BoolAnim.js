op.name="BoolAnim";

var exe=op.addInPort(new Port(op,"exe",OP_PORT_TYPE_FUNCTION));
var bool=op.addInPort(new Port(op,"bool",OP_PORT_TYPE_VALUE,{display:'bool'}));
var valueFalse=op.addInPort(new Port(op,"value false",OP_PORT_TYPE_VALUE));
var valueTrue=op.addInPort(new Port(op,"value true",OP_PORT_TYPE_VALUE));
var duration=op.addInPort(new Port(op,"duration",OP_PORT_TYPE_VALUE));
var easing=op.addInPort(new Port(op,"easing",OP_PORT_TYPE_VALUE,{display:'dropdown',values:["Linear","Cubic In","Cubic Out","Cubic InOut","Expo In","Expo Out","Expo InOut","Sin In","Sin Out","Sin InOut"]} ));

var next=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));
var value=op.addOutPort(new Port(op,"value",OP_PORT_TYPE_VALUE));

valueFalse.set(0);
valueTrue.set(1);
duration.set(0.3);


easing.onValueChanged=function()
{
    if(easing.get()=="Linear") anim.defaultEasing=CABLES.TL.EASING_LINEAR;
    if(easing.get()=="Cubic In") anim.defaultEasing=CABLES.TL.EASING_CUBIC_IN;
    if(easing.get()=="Cubic Out") anim.defaultEasing=CABLES.TL.EASING_CUBIC_OUT;
    if(easing.get()=="Cubic InOut") anim.defaultEasing=CABLES.TL.EASING_CUBIC_INOUT;

    if(easing.get()=="Expo In") anim.defaultEasing=CABLES.TL.EASING_EXPO_IN;
    if(easing.get()=="Expo Out") anim.defaultEasing=CABLES.TL.EASING_EXPO_OUT;
    if(easing.get()=="Expo InOut") anim.defaultEasing=CABLES.TL.EASING_EXPO_INOUT;

    if(easing.get()=="Sin In") anim.defaultEasing=CABLES.TL.EASING_SIN_IN;
    if(easing.get()=="Sin Out") anim.defaultEasing=CABLES.TL.EASING_SIN_OUT;
    if(easing.get()=="Sin InOut") anim.defaultEasing=CABLES.TL.EASING_SIN_INOUT;
};


var anim=new CABLES.TL.Anim();

var startTime=Date.now();

function setAnim()
{

    var now=(Date.now()-startTime)/1000;
    
    var oldValue=anim.getValue(now);
    anim.clear();
    
    anim.setValue(now,oldValue);
    
    if(!bool.get()) anim.setValue(now+duration.get(),valueFalse.get());
        else anim.setValue(now+duration.get(),valueTrue.get());

}

bool.onValueChanged=setAnim;


exe.onTriggered=function()
{
    value.set(anim.getValue( (Date.now()-startTime)/1000 ));
    next.trigger();
};

setAnim();


