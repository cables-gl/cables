Op.apply(this, arguments);
var self=this;
this.name='abs';
this.number=this.addInPort(new Port(this,"number"));
this.result=this.addOutPort(new Port(this,"result"));

this.number.onValueChanged=function()
{
    self.result.val=Math.abs(self.number.val);
};