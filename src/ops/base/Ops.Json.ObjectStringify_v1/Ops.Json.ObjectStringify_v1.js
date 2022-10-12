
var obj=op.inObject("Object");
var result=op.outValue("Result");

var pretty=op.inValueBool("Pretty Print",true);

pretty.onChange=update;
obj.onChange=update;

function update()
{
    try
    {
        if(pretty.get()) result.set(JSON.stringify(obj.get(),null,4));
            else result.set(JSON.stringify(obj.get()));
    }
    catch(e)
    {
        result.set("error");
    }
}

