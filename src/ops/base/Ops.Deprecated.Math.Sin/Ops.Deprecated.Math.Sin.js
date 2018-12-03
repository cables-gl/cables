//Op.apply(this, arguments);
var self=this;
this.name='Sinus';
this.number=this.addInPort(new CABLES.Port(this,"number"));
this.result=this.addOutPort(new CABLES.Port(this,"result"));

this.number.onChange=function()
{
    self.result.val=Math.sin(self.number.val);
};