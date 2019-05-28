var arr=op.inArray(new CABLES.Port(op,"Array",CABLES.OP_PORT_TYPE_ARRAY));
var separator=op.addInPort(new CABLES.Port(op,"separator",CABLES.OP_PORT_TYPE_VALUE,{type:'string'}));
var result=op.addOutPort(new CABLES.Port(op,"string",CABLES.OP_PORT_TYPE_VALUE));

arr.ignoreValueSerialize=true;
result.ignoreValueSerialize=true;

separator.set(',');
arr.onChange=parse;
separator.onChange=parse;

parse();

function parse()
{
    if(arr.get() && arr.get().join)
    {
        var r=arr.get().join(separator.get());
        result.set(r);
    }
}

