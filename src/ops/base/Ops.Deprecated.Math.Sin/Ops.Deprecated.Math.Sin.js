Op.apply(this, arguments);
var self=this;
this.name='Sinus';
this.number=this.addInPort(new Port(this,"number"));
this.result=this.addOutPort(new Port(this,"result"));

this.number.onValueChanged=function()
{
    self.result.val=Math.sin(self.number.val);
};