var inBool=op.inValueBool("Value");
var outFalse=op.outFunction("False");
var outTrue=op.outFunction("True");

inBool.onChange=function()
{
    if(inBool.get()) outTrue.trigger();
        else outFalse.trigger();
    
};