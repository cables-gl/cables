const number=op.addInPort(new CABLES.Port(op,"number"));
const result=op.addOutPort(new CABLES.Port(op,"result"));

number.onValueChanged=function()
{
    let r=Math.sqrt( number.get() );
    if(isNaN(r))r=0;
    result.set(r);
};