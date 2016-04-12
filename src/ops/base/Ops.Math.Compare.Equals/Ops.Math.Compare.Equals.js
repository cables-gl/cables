op.name='Equals';

this.result=this.addOutPort(new Port(this,"result"));
this.number1=this.addInPort(new Port(this,"number1"));
this.number2=this.addInPort(new Port(this,"number2"));

this.exec= function()
{
    self.updateAnims();
    self.result.val=self.number1.val==self.number2.val ;
};

this.number1.onValueChanged=this.exec;
this.number2.onValueChanged=this.exec;