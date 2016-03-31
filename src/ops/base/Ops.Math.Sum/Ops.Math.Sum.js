
this.name='sum';
var result=this.addOutPort(new Port(this,"result"));
var number1=this.addInPort(new Port(this,"number1"));
var number2=this.addInPort(new Port(this,"number2"));

function exec()
{
    var v=parseFloat(number1.get())+parseFloat(number2.get());
    if(!isNaN(v)) result.set( v );
}

number1.onValueChanged=exec;
number2.onValueChanged=exec;

number1.set(1);
number2.set(1);
