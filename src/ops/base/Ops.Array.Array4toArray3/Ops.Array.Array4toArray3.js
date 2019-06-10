const
    inArr=op.inArray("Array"),
    result=op.outArray("Result");

var arr=[];
inArr.onChange=function()
{
    var ia=inArr.get();
    if(!ia)
    {
        result.set([]);
        return;
    }

    arr.length=ia.length/4*3;

    for(var i=0;i<ia.length;i+=4)
    {
        var ind=(i/4)*3;
        arr[ind+0]=ia[i];
        arr[ind+1]=ia[i+1];
        arr[ind+2]=ia[i+2];
    }

    result.set(null);
    result.set(arr);
};