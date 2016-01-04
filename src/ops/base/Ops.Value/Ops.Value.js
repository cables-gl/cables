var self=this;

this.name='Value';
this.exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));
this.v=this.addInPort(new Port(this,"value",OP_PORT_TYPE_VALUE));

this.result=this.addOutPort(new Port(this,"result"));

function frame(time)
{
    self.updateAnims();
    self.exec();
}

this.exec=function()
{
    if(self.result.get()!=self.v.get()) self.result.set(self.v.get());
};

this.exe.onTriggered=this.exec;
this.v.onValueChanged=this.exec;
