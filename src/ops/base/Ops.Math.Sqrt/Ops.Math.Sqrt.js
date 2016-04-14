op.name='Sqrt';

var number=op.addInPort(new Port(op,"number"));

var result=op.addOutPort(new Port(op,"result"));


number.onValueChanged=function()
{
    var r=Math.sqrt( number.get() );
    if(isNaN(r))r=0;
    result.set(r);
};