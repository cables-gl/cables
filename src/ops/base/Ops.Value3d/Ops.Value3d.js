var self=this;

this.name='Value3d';
this.exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));
this.x=this.addInPort(new Port(this,"value x",OP_PORT_TYPE_VALUE));
this.y=this.addInPort(new Port(this,"value y",OP_PORT_TYPE_VALUE));
this.z=this.addInPort(new Port(this,"value z",OP_PORT_TYPE_VALUE));

this.resultX=this.addOutPort(new Port(this,"result x"));
this.resultY=this.addOutPort(new Port(this,"result y"));
this.resultZ=this.addOutPort(new Port(this,"result z"));

function frame(time)
{
    self.updateAnims();
    self.exec();
}

this.exec=function()
{
    if(self.resultX.get()!=self.x.get()) self.resultX.set(self.x.get());
    if(self.resultY.get()!=self.y.get()) self.resultY.set(self.y.get());
    if(self.resultZ.get()!=self.z.get()) self.resultZ.set(self.z.get());
};

this.exe.onTriggered=this.exec;

this.x.onValueChanged=this.exec;
this.y.onValueChanged=this.exec;
this.z.onValueChanged=this.exec;
