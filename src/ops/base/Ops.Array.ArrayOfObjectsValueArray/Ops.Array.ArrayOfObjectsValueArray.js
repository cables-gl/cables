const
    inArr=op.inArray("Array"),
    inKey=op.inString("Key"),
    outArray=op.outArray("Result");

inKey.onChange=inArr.onChange=exec;

function exec()
{
    var arr=inArr.get();

    if(!arr)
    {
        outArray.set(null);
        console.log("no arr");
        return;
    }
    var newArr=[];

    const key=inKey.get();

    for(var i=0;i<arr.length;i++)
    {
        const obj=arr[i];
        if(obj.hasOwnProperty(key)) newArr.push(obj[key]);
    }

    outArray.set(null);
    outArray.set(newArr);
}