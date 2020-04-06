const
    inTrigger=op.inTrigger("Execute"),
    inArray=op.inArray("Array"),
    inIndex=op.inInt("Index",0),
    inValue=op.inFloat("Number",1),
    outArray=op.outArray("Result");

var newArr=[];

inArray.onChange=copyArray;

inTrigger.onTriggered=
function()
{

    const arr=inArray.get();

    console.log({arr});
    if(!arr)return;


    if(newArr.length!=arr.length)newArr.length=arr.length;

    for(var i=0;i<arr.length;i++) newArr[i]=arr[i];

    const idx=Math.floor(inIndex.get());

    if(idx>=0)
    {
        newArr[idx]=inValue.get();

    }

    inArray.onChange=null;
    outArray.set(null);
    outArray.set(newArr);

};

function copyArray()
{

    const arr=inArray.get();

    if(arr && !outArray.get())
    {

        if(newArr.length!=arr.length) newArr.length=arr.length;
        for(var i=0;i<arr.length;i++) newArr[i]=arr[i];

        outArray.set(null);
        outArray.set(newArr);

    }

}