const
    bool0=op.inValueBool("bool 1"),
    bool1=op.inValueBool("bool 2"),
    result=op.outValueBool("result");

bool0.onChange=exec;
bool1.onChange=exec;

function exec()
{
    result.set( bool1.get() && bool0.get() );
}