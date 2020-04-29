const
    bool0=op.inValueBool("bool 1"),
    bool1=op.inValueBool("bool 2"),
    bool2=op.inValueBool("bool 3"),
    bool3=op.inValueBool("bool 4"),
    bool4=op.inValueBool("bool 5"),
    bool5=op.inValueBool("bool 6"),
    bool6=op.inValueBool("bool 7"),
    bool7=op.inValueBool("bool 8"),
    result=op.outValueBool("result");

bool0.onChange=
    bool1.onChange=
    bool2.onChange=
    bool3.onChange=
    bool4.onChange=
    bool5.onChange=
    bool6.onChange=
    bool7.onChange=exec;

function exec()
{
    result.set( bool0.get() || bool1.get()  || bool2.get() || bool3.get() || bool4.get() || bool5.get() || bool6.get() || bool7.get() );
}

