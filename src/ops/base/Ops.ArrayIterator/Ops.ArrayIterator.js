Op.apply(this, arguments);
var self=this;

this.name='ArrayIterator';
this.exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));
this.arr=this.addInPort(new Port(this,"array",OP_PORT_TYPE_ARRAY));

this.num=this.addInPort(new Port(this,"num"));
this.num.val=5;

this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));
this.idx=this.addOutPort(new Port(this,"index"));
this.val=this.addOutPort(new Port(this,"value"));

this.exe.onTriggered=function()
{
    if(!self.arr.val)return;
    for(var i in self.arr.val)
    {
        self.idx.val=i;
        self.val.val=self.arr.val[i];
        self.trigger.trigger();
    }
};
