const bool = op.inValueBool("Boolean");
const outbool = op.outValue("Result");

bool.changeAlways = true;

bool.onChange = function ()
{
    // outbool.set( ! (true==bool.get()) );
    outbool.set(!bool.get());
};
