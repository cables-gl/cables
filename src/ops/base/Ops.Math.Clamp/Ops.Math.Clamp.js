const val=op.inValueFloat("val",0.5);
const min=op.inValueFloat("min",0);
const max=op.inValueFloat("max",1);
const ignore=op.inValueBool("ignore outside values");
const result=op.outValue("result");

val.onChange=min.onChange=max.onChange=clamp;

function clamp()
{
    if(ignore.get())
    {
        if(val.get()>max.get()) return;
        if(val.get()<min.get()) return;
    }
    result.set( Math.min(Math.max(val.get(), min.get()), max.get()));
}

