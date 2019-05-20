const v=op.inValueFloat("value");
const result=op.outValue("result");

v.onChange=exec;

function exec()
{
    op.setTitle(v.get());
    result.set(v.get());
}

