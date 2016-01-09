
this.name='Repeat';
var exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));
var num=this.addInPort(new Port(this,"num"));

num.set(5);

var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));
var idx=this.addOutPort(new Port(this,"index"));

exe.onTriggered=function()
{
    for(var i=num.get()-1;i>-1;i--)
    {
        idx.set(i);
        trigger.trigger();
    }
};

