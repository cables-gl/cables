var bool=op.inValueBool("Boolean");
var outbool=op.outValue("Result");

bool.changeAlways=true;

bool.onChange=function()
{
    outbool.set( ! (true==bool.get()) );
};
