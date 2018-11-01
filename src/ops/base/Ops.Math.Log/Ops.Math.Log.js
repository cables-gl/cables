const number=op.addInPort(new CABLES.Port(op,"number"));
const result=op.addOutPort(new CABLES.Port(op,"result"));

number.onChange=function()
{
    var r=Math.log( number.get() );
    if(isNaN(r))r=0;
    result.set(r);
};