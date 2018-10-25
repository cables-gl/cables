var number=op.addInPort(new CABLES.Port(op,"number"));
var result=op.addOutPort(new CABLES.Port(op,"result"));

number.onValueChanged=function()
{
    var r=Math.exp( number.get() );
    if(isNaN(r))r=0;
    result.set(r);
};