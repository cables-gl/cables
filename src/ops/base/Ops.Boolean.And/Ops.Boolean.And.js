const
    bool0 = op.inBool("bool 1"),
    bool1 = op.inBool("bool 2"),
    result = op.outValueBool("result");

bool0.onChange =
bool1.onChange = exec;

function exec()
{
    result.set(bool1.get() && bool0.get());
}
