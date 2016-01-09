Op.apply(this, arguments);
var self=this;

this.name='Repeat';
this.exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));

this.num=this.addInPort(new Port(this,"num"));
this.num.val=5;

this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));
this.idx=this.addOutPort(new Port(this,"index"));

this.exe.onTriggered=function()
{
    for(var i=self.num.get()-1;i>-1;i--)
    {
        self.idx.set(i);
        self.trigger.trigger();
    }
};

