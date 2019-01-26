const
    result=op.outValue("result"),
    value=op.inValueFloat("value"),
    max=op.inValueFloat("Maximum");

max.onChange=exec;
value.onChange=exec;

value.set(1);
max.set(1);

function exec()
{
    var v=Math.max(value.get(),max.get());
    if(v==v) result.set( v );
}

