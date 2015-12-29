Op.apply(this, arguments);
var self=this;

this.name='bool';
// this.exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));
this.v=this.addInPort(new Port(this,"value",OP_PORT_TYPE_VALUE,{display:'bool'}));

this.result=this.addOutPort(new Port(this,"result"));


this.exec=function()
{
    if(self.result.get()!=self.v.get()) self.result.set(self.v.get());
};

// this.exe.onTriggered=this.exec;
this.v.onValueChanged=this.exec;
