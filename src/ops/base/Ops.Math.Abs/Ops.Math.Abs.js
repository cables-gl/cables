op.name='abs';
var number=op.addInPort(new Port(op,"number"));
var result=op.addOutPort(new Port(op,"result"));

number.onValueChanged=function()
{
    result.set( Math.abs(number.get()) );
};