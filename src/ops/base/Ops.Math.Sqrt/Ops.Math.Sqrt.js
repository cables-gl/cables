const number=op.addInPort(new Port(op,"number"));
const result=op.addOutPort(new Port(op,"result"));

number.onValueChanged=function()
{
    let r=Math.sqrt( number.get() );
    if(isNaN(r))r=0;
    result.set(r);
};