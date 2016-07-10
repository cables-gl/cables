op.name="Incrementor";


var inLength=this.addInPort(new Port(this,"Length",OP_PORT_TYPE_VALUE));
var increment=this.addInPort(new Port(this,"Increment",OP_PORT_TYPE_FUNCTION));
var decrement=this.addInPort(new Port(this,"Decrement",OP_PORT_TYPE_FUNCTION));

var value=this.addOutPort(new Port(this,"Value",OP_PORT_TYPE_VALUE));

inLength.set(10);
var val=0;

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