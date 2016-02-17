
this.name='multiply';

var result=this.addOutPort(new Port(this,"result"));
var number1=this.addInPort(new Port(this,"number1"));
var number2=this.addInPort(new Port(this,"number2"));

var update= function()
{
    this.updateAnims();
    result.set( number1.get()*number2.get()*1 );
};

number1.onValueChange(update);
number2.onValueChange(update);

number1.set(1);
number2.set(2);
