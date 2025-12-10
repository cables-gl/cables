const
    bool = op.inValueBool("in bool"),
    outbool = op.outBoolNum("out bool");

bool.changeAlways = true;

bool.onChange = function ()
{
    outbool.set(!(bool.get() == true));
};
