const
    bool=op.inValueBool("in bool"),
    outbool=op.outValueBool("out bool");

bool.changeAlways=true;

bool.onChange=function()
{
    outbool.set( ! (true==bool.get()) );
};