var inBool=op.inValueBool("Value");
var outTrue=op.outTrigger("True");
var outFalse=op.outTrigger("False");

inBool.onChange=function()
{
    if(inBool.get()) outTrue.trigger();
        else outFalse.trigger();
    
};