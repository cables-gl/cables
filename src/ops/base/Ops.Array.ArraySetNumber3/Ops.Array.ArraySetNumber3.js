const
    inTrigger=op.inTriggerButton("Execute"),
    inArray=op.inArray("Array"),
    inIndex=op.inInt("Index",0),
    inValueX=op.inFloat("X",1),
    inValueY=op.inFloat("Y",1),
    inValueZ=op.inFloat("Z",1),
    inReset=op.inTriggerButton("Reset"),
    outArray=op.outArray("Result");

var newArr=[];

inReset.onTriggered=function(){
    copyArray(true);
};
inArray.onChange=copyArray;

inTrigger.onTriggered=
function()
{

    const arr=inArray.get();

    console.log({arr});
    if(!arr)return;
    if(newArr.length!=arr.length)newArr.length=arr.length;

    const idx=Math.floor(inIndex.get());

    if(idx>=0)
    {
        newArr[idx*3+0]=inValueX.get();
        newArr[idx*3+1]=inValueY.get();
        newArr[idx*3+2]=inValueZ.get();
    }

    inArray.onChange=null;
    outArray.set(null);
    outArray.set(newArr);

};

function copyArray(force)
{

    const arr=inArray.get();

    if(!arr) return;

    if(force===true || (arr && !outArray.get()))
    {

        if(newArr.length!=arr.length) newArr.length=arr.length;
        for(var i=0;i<arr.length;i++) newArr[i]=arr[i];

        outArray.set(null);
        outArray.set(newArr);

    }

}