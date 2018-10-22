var inBool=op.inValueBool("Value");
var outTrue=op.outFunction("True");
var outFalse=op.outFunction("False");

inBool.onChange=function()
{
    if(inBool.get()) outTrue.trigger();
        else outFalse.trigger();
    
};