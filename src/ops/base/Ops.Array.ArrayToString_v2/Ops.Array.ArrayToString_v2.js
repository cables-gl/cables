var arr=op.inArray("Array");
var separator=op.inString("Separator");
var result=op.outString("Result",'');

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
    else result.set('');
}

