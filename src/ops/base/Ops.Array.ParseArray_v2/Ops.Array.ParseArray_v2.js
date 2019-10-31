var text=op.inStringEditor("text",'1,2,3');
var separator=op.inValueString("separator",",");
var toNumber=op.inValueBool("Numbers",true);
var parsed=op.outTrigger("Parsed");
var arr=op.outArray("array");
var len=op.outValue("length");

text.onChange=parse;
separator.onChange=parse;
toNumber.onChange=parse;

parse();

function parse()
{
    if(!text.get())return;

    var r=text.get().split(separator.get());

    if(r[r.length-1]==="") r.length-=1;

    len.set(r.length);

    op.setError(null);

    if(toNumber.get())
        for(var i=0;i<r.length;i++)
        {
            r[i]=Number(r[i]);
            if(!CABLES.UTILS.isNumeric(r[i]))op.setError("Parse Error / Not all values numerical!");
        }

    arr.set(null);
    arr.set(r);
    parsed.trigger();
}

