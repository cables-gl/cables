op.name="Max";

var result=op.addOutPort(new Port(op,"result"));
var value=op.addInPort(new Port(op,"value"));
var max=op.addInPort(new Port(op,"Maximum"));

function exec()
{
    var v=Math.max(value.get(),max.get());
    if(v==v) result.set( v );
}

max.onValueChanged=exec;
value.onValueChanged=exec;

value.set(1);
max.set(1);
