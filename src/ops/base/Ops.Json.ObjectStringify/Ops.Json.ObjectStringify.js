var inObj=op.inObject("Object");
var inBeautify=op.inBool("beautify");
var outString=op.outValue("Result");

inBeautify.onChange=update;
inObj.onChange=update;

function update()
{
    if(inBeautify.get())outString.set(JSON.stringify(inObj.get()));
        else outString.set(JSON.stringify(inObj.get(),false,4));
}


