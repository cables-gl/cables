op.name='Sqrt';

var number=this.addInPort(new Port(this,"number"));

var result=this.addOutPort(new Port(this,"result"));


number.onValueChanged=function()
{
    result.set(Math.sqrt( number.get() ));
};