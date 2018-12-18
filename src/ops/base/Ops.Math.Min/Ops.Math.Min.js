const result=op.outValue("result");
var value=op.addInPort(new CABLES.Port(op,"value"));
var min=op.addInPort(new CABLES.Port(op,"Minimum"));

function exec()
{
    var v=Math.min(value.get(),min.get());
    if(v==v) result.set( v );
}

min.onChange=exec;
value.onChange=exec;

value.set(1);
min.set(1);
