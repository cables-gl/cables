CABLES.Op.apply(this, arguments);
var self=this;

this.name='if between then';
this.exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));

this.number=this.addInPort(new Port(this,"number"));
this.number.val=0;

this.min=this.addInPort(new Port(this,"min"));
this.min.val=0;

this.max=this.addInPort(new Port(this,"max"));
this.max.val=1;

this.triggerThen=this.addOutPort(new Port(this,"then",OP_PORT_TYPE_FUNCTION));
this.triggerElse=this.addOutPort(new Port(this,"else",OP_PORT_TYPE_FUNCTION));

this.exe.onTriggered=function()
{
    if(self.number.get()>=self.min.get() && self.number.get()<self.max.get()) self.triggerThen.trigger();
        else self.triggerElse.trigger();
};
