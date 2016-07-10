op.name="Average";

var number=op.addInPort(new Port(op,"number"));
var result=op.addOutPort(new Port(op,"result"));


number.onValueChanged=function()
{
    result.set( (result.get()*0.8+number.get())*0.2 );
    
};

number.set(1);

