op.name='Sqrt';

var number=this.addInPort(new Port(this,"number"));

var result=this.addOutPort(new Port(this,"result"));


number.onValueChanged=function()
{
    var r=Math.sqrt( number.get() );
    if(isNaN(r))r=0;
    result.set(r);
};