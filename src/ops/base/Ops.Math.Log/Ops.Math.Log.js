op.name='Log';

var number=this.addInPort(new Port(this,"number"));

var result=this.addOutPort(new Port(this,"result"));


number.onValueChanged=function()
{
    var r=Math.log( number.get() );
    if(isNaN(r))r=0;
    result.set(r);
};