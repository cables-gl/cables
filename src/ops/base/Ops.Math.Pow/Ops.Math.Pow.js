const base=op.inValueFloat("Base");
const exponent=op.inValueFloat("Exponent");
const result=op.outValue("Result");

exponent.set(2);

base.onChange=update;
exponent.onChange=update;

function update()
{
    let r=Math.pow( base.get(), exponent.get() );
    if(isNaN(r))r=0;
    result.set(r);
}