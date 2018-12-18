const
    result=op.outValue("result"),
    number=op.inValueFloat("number",0),
    min=op.inValueFloat("min",0),
    max=op.inValueFloat("max",1);

var subAdd=0;
number.onChange=max.onChange=min.onChange=exec;
exec();

function exec()
{
    // todo negative min ?

    var x = Math.max(0, Math.min(1, (number.get()-min.get())/(max.get()-min.get())));
    result.set( x*x*(3 - 2*x) ); // smoothstep
}
