var self=this;
this.name='ColorValue';

this.g=this.addInPort(new Port(this,"ignore",OP_PORT_TYPE_FUNCTION,{display:'readonly'}));
this.r=this.addInPort(new Port(this,"r",OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true' }));
this.g=this.addInPort(new Port(this,"g",OP_PORT_TYPE_VALUE,{ display:'range' }));
this.b=this.addInPort(new Port(this,"b",OP_PORT_TYPE_VALUE,{ display:'range' }));
this.a=this.addInPort(new Port(this,"a",OP_PORT_TYPE_VALUE,{ display:'range' }));

this.outR=this.addOutPort(new Port(this,"outr",OP_PORT_TYPE_VALUE));
this.outG=this.addOutPort(new Port(this,"outg",OP_PORT_TYPE_VALUE));
this.outB=this.addOutPort(new Port(this,"outb",OP_PORT_TYPE_VALUE));
this.outA=this.addOutPort(new Port(this,"outa",OP_PORT_TYPE_VALUE));

var exec=function()
{
    self.outR.val=self.r.val;
    self.outG.val=self.g.val;
    self.outB.val=self.b.val;
    self.outA.val=self.a.val;
};

this.r.onValueChanged=exec;
this.g.onValueChanged=exec;
this.b.onValueChanged=exec;
this.a.onValueChanged=exec;
