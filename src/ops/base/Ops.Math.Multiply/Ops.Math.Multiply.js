Op.apply(this, arguments);
var self=this;

this.name='multiply';
this.result=this.addOutPort(new Port(this,"result"));
this.number1=this.addInPort(new Port(this,"number1"));
this.number2=this.addInPort(new Port(this,"number2"));

this.exec= function()
{
    self.updateAnims();
    self.result.set(self.number1.get()*self.number2.get()*1 );
};

this.number1.onValueChanged=this.exec;
this.number2.onValueChanged=this.exec;

this.number1.set(1);
this.number2.set(2);
