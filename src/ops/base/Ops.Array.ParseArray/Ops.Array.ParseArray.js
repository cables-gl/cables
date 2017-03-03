op.name="ParseArray";

var text=op.addInPort(new Port(op,"text",OP_PORT_TYPE_VALUE,{type:'string',display:'editor'}));
// var separator=op.addInPort(new Port(op,"separator",OP_PORT_TYPE_VALUE,{type:'string',display:'editor'}));
var separator=op.inValueString("separator",",");

var toNumber=op.inValueBool("Numbers",false);

var arr=op.addOutPort(new Port(op,"array",OP_PORT_TYPE_ARRAY));
var len=op.addOutPort(new Port(op,"length",OP_PORT_TYPE_VALUE));

separator.set(',');
text.set('1,2,3');

text.onValueChanged=parse;
separator.onValueChanged=parse;
toNumber.onChange=parse;

parse();

function parse()
{
    var r=text.get().split(separator.get());
    len.set(r.length);

    
    
    if(toNumber.get())
    {
        for(var i=0;i<r.length;i++)
        {
            r[i]=Number(r[i]);
        }
        
    }
    
    arr.set(r);
}
