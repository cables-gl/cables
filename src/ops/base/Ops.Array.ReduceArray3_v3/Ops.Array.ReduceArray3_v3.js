const
    arr=op.inArray("Array"),
    num=op.inValueInt("Every xth Item",2),
    outArr=op.outArray("Result Array");

num.onChange=
    arr.onChange=update;

const newArray=[];

function update()
{
    var theArray=arr.get();
    if(!theArray)return;

    const step=Math.max(0,Math.floor(num.get()));
    const newArray=[];

    if(step===0)
    {
        outArr.set(null);
        outArr.set([]);
        return;
    }

    for(var i=0;i<theArray.length;i+=step*3)
        newArray.push(theArray[i+0],theArray[i+1],theArray[i+2]);

    outArr.set(null);
    outArr.set(newArray);

}