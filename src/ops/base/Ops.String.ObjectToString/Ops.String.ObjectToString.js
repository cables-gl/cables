op.name="ObjectToString";

var obj=op.inObject("Object");
var result=op.outValue("Result");

obj.onChange=update;

function update()
{
    try
    {
        var string="";
        var o=obj.get();

        if(typeof(o[i])==='number') o[i]=Math.round(o[i]*100)/100;

        for(var i in o)
            string+=i+": "+o[i]+"\n";

        result.set(string);
    }
    catch(e)
    {
        result.set("error");
    }
}

