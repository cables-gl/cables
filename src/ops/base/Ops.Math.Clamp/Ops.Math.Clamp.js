const val=op.addInPort(new CABLES.Port(op,"val"));
const min=op.addInPort(new CABLES.Port(op,"min"));
const max=op.addInPort(new CABLES.Port(op,"max"));
const ignore=op.addInPort(new CABLES.Port(op,"ignore outside values",CABLES.OP_PORT_TYPE_VALUE,{'display':'bool'}));
const result=op.addOutPort(new CABLES.Port(op,"result"));

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

val.onChange=clamp;
min.onChange=clamp;
max.onChange=clamp;

val.set(0.5);
