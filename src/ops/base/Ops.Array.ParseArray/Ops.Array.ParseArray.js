var text=op.addInPort(new CABLES.Port(op,"text",CABLES.OP_PORT_TYPE_VALUE,{type:'string',display:'editor'}));
var separator=op.inValueString("separator",",");

var toNumber=op.inValueBool("Numbers",false);

var parsed=op.outTrigger("Parsed");
var arr=op.addOutPort(new CABLES.Port(op,"array",CABLES.OP_PORT_TYPE_ARRAY));
var len=op.addOutPort(new CABLES.Port(op,"length",CABLES.OP_PORT_TYPE_VALUE));

separator.set(',');
text.set('1,2,3');

text.onValueChanged=parse;
separator.onValueChanged=parse;
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
