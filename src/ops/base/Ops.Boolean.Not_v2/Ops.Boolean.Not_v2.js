const
    bool = op.inBool("Boolean"),
    outbool = op.outBoolNum("Result", true);

bool.changeAlways = true;

bool.onChange = function ()
{
    outbool.set((!bool.get()));
};
