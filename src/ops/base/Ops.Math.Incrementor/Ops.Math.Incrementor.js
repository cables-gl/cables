op.name="Increment";

var inLength=this.addInPort(new Port(this,"Length",OP_PORT_TYPE_VALUE));
var reset=this.addInPort(new Port(this,"Reset",OP_PORT_TYPE_FUNCTION));
var increment=this.addInPort(new Port(this,"Increment",OP_PORT_TYPE_FUNCTION));
var decrement=this.addInPort(new Port(this,"Decrement",OP_PORT_TYPE_FUNCTION));

var value=this.addOutPort(new Port(this,"Value",OP_PORT_TYPE_VALUE));

value.ignoreValueSerialize=true;
inLength.set(10);
var val=0;
value.set(0);

reset.onTriggered=function()
{
    val=0;
    value.set(val);
};

decrement.onTriggered=function()
{
    val--;
    if(val<0)val=inLength.get()-1;
    value.set(val);
};

increment.onTriggered=function()
{
    val++;
    if(val>=inLength.get())val=0;
    value.set(val);
};
