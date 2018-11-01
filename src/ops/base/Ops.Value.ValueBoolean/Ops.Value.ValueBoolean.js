const v=op.inValueBool("value",false);
const result=op.addOutPort(new CABLES.Port(op,"result"));

result.set(false);
v.onChange=exec;

function exec()
{
    if(result.get()!=v.get()) result.set(v.get());
}

