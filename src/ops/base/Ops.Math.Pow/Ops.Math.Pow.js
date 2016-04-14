op.name='Pow';

var number=op.addInPort(new Port(op,"number"));
var exponent=op.addInPort(new Port(op,"exponent"));

var result=op.addOutPort(new Port(op,"result"));

exponent.set(2);

number.onValueChanged=function()
{
    var r=Math.pow( number.get(), exponent.get() );
    if(isNaN(r))r=0;
    result.set(r);
};