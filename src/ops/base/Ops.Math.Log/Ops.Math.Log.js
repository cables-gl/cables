op.name='Log';

var number=this.addInPort(new Port(this,"number"));

var result=this.addOutPort(new Port(this,"result"));


number.onValueChanged=function()
{
    result.set(Math.log( number.get() ));
};