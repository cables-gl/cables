const
    bool0 = op.inValueBool("bool 1"),
    bool1 = op.inValueBool("bool 2"),
    result = op.outBoolNum("result");

bool0.onChange =
bool1.onChange = exec;

function exec()
{
    result.set(bool1.get() && bool0.get());
}
