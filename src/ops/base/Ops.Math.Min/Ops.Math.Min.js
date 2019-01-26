const result=op.outValue("result");
const value=op.inValueFloat("value");
const min=op.inValueFloat("Minimum");

function exec()
{
    var v=Math.min(value.get(),min.get());
    if(v==v) result.set( v );
}

min.onChange=exec;
value.onChange=exec;

value.set(1);
min.set(1);
