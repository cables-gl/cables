op.name='Exp';

var number=this.addInPort(new Port(this,"number"));

var result=this.addOutPort(new Port(this,"result"));


number.onValueChanged=function()
{
    var r=Math.exp( number.get() );
    if(isNaN(r))r=0;
    result.set(r);
};