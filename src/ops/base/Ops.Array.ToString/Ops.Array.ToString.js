op.name="ToString";

var arr=op.addInPort(new Port(op,"Array",OP_PORT_TYPE_ARRAY));
var separator=op.addInPort(new Port(op,"separator",OP_PORT_TYPE_VALUE,{type:'string'}));
var result=op.addOutPort(new Port(op,"string",OP_PORT_TYPE_VALUE));

arr.ignoreValueSerialize=true;
result.ignoreValueSerialize=true;

separator.set(',');
arr.onValueChanged=parse;
separator.onValueChanged=parse;

parse();

function parse()
{
    if(arr.get() && arr.get().join)
    {
        var r=arr.get().join(separator.get());
        result.set(r);
    }
}

