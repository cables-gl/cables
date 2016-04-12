this.name='SinusAnim';
this.exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));
this.result=this.addOutPort(new Port(this,"result"));

this.phase=this.addInPort(new Port(this,"phase",OP_PORT_TYPE_VALUE));
this.mul=this.addInPort(new Port(this,"frequency",OP_PORT_TYPE_VALUE));
this.amplitude=this.addInPort(new Port(this,"amplitude",OP_PORT_TYPE_VALUE));

var self=this;

this.exe.onTriggered=function()
{
    self.result.val = self.amplitude.val*Math.sin( ( Date.now()/1000.0 * self.mul.val ) + parseFloat(self.phase.val) );
};

this.mul.val=1.0;
this.amplitude.val=1.0;
this.phase.val=1;
this.exe.onTriggered();