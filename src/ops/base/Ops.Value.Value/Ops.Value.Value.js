const v=op.inValueFloat("value");
const result=op.outValue("result");

v.onChange=exec;

function exec()
{
    result.set(parseFloat(v.get()));
}