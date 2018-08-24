
const inObj=op.inObject("Object");
const outResult=op.outValueBool("Result");


inObj.onChange=function()
{
if(!inObj.get())
{
    outResult.set(true);
}
        
};
