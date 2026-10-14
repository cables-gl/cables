const result=op.outNumber("result");
const value=op.inFloat("value");
const min=op.inFloat("Minimum");

function exec()
{
    var v=Math.min(value.get(),min.get());
    if(v==v) result.set( v );
}

min.onChange=exec;
value.onChange=exec;

value.set(1);
min.set(1);
