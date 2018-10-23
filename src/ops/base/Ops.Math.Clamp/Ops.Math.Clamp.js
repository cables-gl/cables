op.name='Clamp';
var val=op.addInPort(new Port(op,"val"));
var min=op.addInPort(new Port(op,"min"));
var max=op.addInPort(new Port(op,"max"));
var ignore=op.addInPort(new Port(op,"ignore outside values",CABLES.OP_PORT_TYPE_VALUE,{'display':'bool'}));
var result=op.addOutPort(new Port(op,"result"));

function clamp()
{
    if(ignore.get())
    {
        if(val.get()>max.get()) return;
        if(val.get()<min.get()) return;
    }
    result.set( Math.min(Math.max(val.get(), min.get()), max.get()));
}

min.set(0);
max.set(1);

val.onValueChanged=clamp;
min.onValueChanged=clamp;
max.onValueChanged=clamp;

val.set(0.5);
