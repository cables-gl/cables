const
    bool0 = op.inBool("bool 1"),
    bool1 = op.inBool("bool 2"),
    bool2 = op.inBool("bool 3"),
    bool3 = op.inBool("bool 4"),
    bool4 = op.inBool("bool 5"),
    bool5 = op.inBool("bool 6"),
    bool6 = op.inBool("bool 7"),
    bool7 = op.inBool("bool 8"),
    bool8 = op.inBool("bool 9"),
    bool9 = op.inBool("bool 10"),
    result = op.outValueBool("result");

bool0.onChange =
    bool1.onChange =
    bool2.onChange =
    bool3.onChange =
    bool4.onChange =
    bool5.onChange =
    bool6.onChange =
    bool7.onChange =
    bool8.onChange =
    bool9.onChange = exec;

function exec()
{
    result.set(bool0.get() || bool1.get() || bool2.get() || bool3.get() || bool4.get() || bool5.get() || bool6.get() || bool7.get() || bool8.get() || bool9.get());
}
