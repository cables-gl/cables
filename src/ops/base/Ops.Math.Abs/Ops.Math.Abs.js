op.name='abs';
var number=op.addInPort(new CABLES.Port(op,"number"));
var result=op.addOutPort(new CABLES.Port(op,"result"));

number.onChange=function()
{
    result.set( Math.abs(number.get()) );
};