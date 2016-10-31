op.name='Pow';

var base=op.addInPort(new Port(op,"Base"));
var exponent=op.addInPort(new Port(op,"Exponent"));

var result=op.addOutPort(new Port(op,"Result"));

exponent.set(2);

base.onValueChanged=update;
exponent.onValueChanged=update;

function update()
{
    var r=Math.pow( base.get(), exponent.get() );
    if(isNaN(r))r=0;
    result.set(r);
}