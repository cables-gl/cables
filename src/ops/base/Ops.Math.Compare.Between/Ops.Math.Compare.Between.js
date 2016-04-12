Op.apply(this, arguments);
var self=this;

this.name='Between';
this.result=this.addOutPort(new Port(this,"result"));
this.number=this.addInPort(new Port(this,"value"));
this.number1=this.addInPort(new Port(this,"number1"));
this.number2=this.addInPort(new Port(this,"number2"));
this.number.val=2.0;
this.number1.val=1.0;
this.number2.val=3.0;

this.exec= function()
{
    self.updateAnims();
    self.result.val=
        (
            self.number.val>Math.min(self.number1.val,self.number2.val) &&
            self.number.val<Math.max(self.number1.val,self.number2.val)
        );
};

this.number1.onValueChanged=this.exec;
this.number2.onValueChanged=this.exec;
this.number.onValueChanged=this.exec;
this.exec();