Op.apply(this, arguments);
var self=this;

this.name='isEven';
this.result=this.addOutPort(new Port(this,"result"));
this.number1=this.addInPort(new Port(this,"number1"));

this.exec= function()
{
    self.result.val=!( self.number1.val & 1 );
};

this.number1.onValueChanged=this.exec;
