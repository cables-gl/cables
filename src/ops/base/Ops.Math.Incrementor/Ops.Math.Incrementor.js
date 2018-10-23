var increment = op.inFunctionButton("Increment");
var decrement = op.inFunctionButton("Decrement");
var inLength=op.addInPort(new Port(op,"Length",CABLES.OP_PORT_TYPE_VALUE));
// var reset=op.addInPort(new Port(op,"Reset",CABLES.OP_PORT_TYPE_FUNCTION));
var reset=op.inFunctionButton("Reset");


var inMode=op.inValueSelect("Mode",["Rewind","Stop at Max"]);

var value=op.addOutPort(new Port(op,"Value",CABLES.OP_PORT_TYPE_VALUE));

var outRestarted=op.outFunction("Restarted");

value.ignoreValueSerialize=true;
inLength.set(10);
var val=0;
value.set(0);

inLength.onTriggered=reset;
reset.onTriggered=doReset;

var MODE_REWIND=0;
var MODE_STOP=1;

var mode=MODE_REWIND;

inMode.onChange=function()
{
    if(inMode.get()=="Rewind")
    {
        mode=MODE_REWIND;
    }
    if(inMode.get()=="Stop at Max")
    {
        mode=MODE_STOP;
    }

    
};

function doReset()
{
    value.set(null);
    val=0;
    value.set(val);
    outRestarted.trigger();
}

decrement.onTriggered=function()
{
    val--;
    if(mode==MODE_REWIND && val<0)val=inLength.get()-1;
    if(mode==MODE_STOP && val<0)val=0;

    value.set(val);
};

increment.onTriggered=function()
{
    val++;
    if(mode==MODE_REWIND && val>=inLength.get())
    {
        val=0;
        outRestarted.trigger();
    }
    if(mode==MODE_STOP && val>=inLength.get())val=inLength.get()-1;
    
    value.set(val);
};
