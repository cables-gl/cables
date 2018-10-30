var result=op.addOutPort(new CABLES.Port(op,"result"));
var value=op.addInPort(new CABLES.Port(op,"value"));
var max=op.addInPort(new CABLES.Port(op,"Maximum"));

function exec()
{
    var v=Math.max(value.get(),max.get());
    if(v==v) result.set( v );
}

max.onChange=exec;
value.onChange=exec;

value.set(1);
max.set(1);
