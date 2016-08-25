op.name="Min";

var result=op.addOutPort(new Port(op,"result"));
var value=op.addInPort(new Port(op,"value"));
var min=op.addInPort(new Port(op,"Minimum"));

function exec()
{
    var v=Math.min(value.get(),min.get());
    if(v==v) result.set( v );
}

min.onValueChanged=exec;
value.onValueChanged=exec;

value.set(1);
min.set(1);
