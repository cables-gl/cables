var text=op.addInPort(new CABLES.Port(op,"text",CABLES.OP_PORT_TYPE_VALUE,{type:'string',display:'editor'}));
var separator=op.inValueString("separator",",");
var toNumber=op.inValueBool("Numbers",true);
var parsed=op.outTrigger("Parsed");
var arr=op.outArray("array");
var len=op.outValue("length");

separator.set(',');
text.set('1,2,3');

text.onChange=parse;
separator.onChange=parse;
toNumber.onChange=parse;

parse();

function parse()
{
    if(!text.get())return;

    var r=text.get().split(separator.get());
    len.set(r.length);

    if(toNumber.get())
    {
        for(var i=0;i<r.length;i++)
        {
            r[i]=Number(r[i]);
        }
    }

    arr.set(null);
    arr.set(r);
    parsed.trigger();
}
