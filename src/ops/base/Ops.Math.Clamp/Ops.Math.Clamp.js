this.name='Clamp';
var val=this.addInPort(new Port(this,"val"));
var min=this.addInPort(new Port(this,"min"));
var max=this.addInPort(new Port(this,"max"));
var ignore=this.addInPort(new Port(this,"ignore outside values",OP_PORT_TYPE_VALUE,{'display':'bool'}));
var result=this.addOutPort(new Port(this,"result"));

function clamp()
{
    if(ignore.get())
    {
        if(val.get()>max.get()) return;
        if(val.get()<min.get()) return;
    }
    result.set( Math.min(Math.max(val.get(), min.get()), max.get()));
}

min.val=0;
max.val=1;

val.onValueChanged=clamp;
min.onValueChanged=clamp;
max.onValueChanged=clamp;

val.val=0.5;
