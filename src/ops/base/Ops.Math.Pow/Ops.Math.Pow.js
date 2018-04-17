const base=op.addInPort(new Port(op,"Base"));
const exponent=op.addInPort(new Port(op,"Exponent"));

const result=op.addOutPort(new Port(op,"Result"));

exponent.set(2);

base.onValueChanged=update;
exponent.onValueChanged=update;

function update()
{
    let r=Math.pow( base.get(), exponent.get() );
    if(isNaN(r))r=0;
    result.set(r);
}