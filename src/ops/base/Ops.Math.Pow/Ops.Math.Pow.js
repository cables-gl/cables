op.name='Pow';

var number=this.addInPort(new Port(this,"number"));
var exponent=this.addInPort(new Port(this,"exponent"));

var result=this.addOutPort(new Port(this,"result"));

exponent.set(2);

number.onValueChanged=function()
{
    result.set(Math.pow( number.get(), exponent.get() ));
};