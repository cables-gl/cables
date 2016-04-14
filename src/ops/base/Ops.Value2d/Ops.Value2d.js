var self=this;

this.name='Value2d';
this.exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));
this.x=this.addInPort(new Port(this,"value x",OP_PORT_TYPE_VALUE));
this.y=this.addInPort(new Port(this,"value y",OP_PORT_TYPE_VALUE));

this.resultX=this.addOutPort(new Port(this,"result x"));
this.resultY=this.addOutPort(new Port(this,"result y"));

function frame(time)
{
    self.updateAnims();
    self.exec();
}

this.exec=function()
{
    if(self.resultX.get()!=self.x.get()) self.resultX.set(self.x.get());
    if(self.resultY.get()!=self.y.get()) self.resultY.set(self.y.get());
};

this.exe.onTriggered=this.exec;

this.x.onValueChanged=this.exec;
this.y.onValueChanged=this.exec;
// this.onAnimFrame=function(){};
