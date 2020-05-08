var arr=op.inArray("Array");
var num=op.inValueInt("Every xth Item",2);
var maxOldIndex=op.inValueInt("Max Index",0);
var outArr=op.outArray("Result Array");

num.onChange=update;
arr.onChange=update;

var newArray=[];

function update()
{
    var theArray=arr.get();
    if(!theArray)return;

    var theLength=theArray.length;

    if(maxOldIndex.get()!=0)
    {
        theLength=maxOldIndex.get();
    }

    if(num.get() === 0)
    {
        outArr.set(null);
        return;
    }
    var newLength=Math.floor(theLength/num.get());

    if(newLength<=0 || newLength!=newLength)
    {
        outArr.set(null);
        return;
    }


    var step=num.get()*3;
    // newArray.length=newLength;

    var count=0;
    var i=0;
    for( i=0;i<theLength*3;i+=step)
    {
        newArray[count]=theArray[i];
        count++;
        newArray[count]=theArray[i+1];
        count++;
        newArray[count]=theArray[i+2];
        count++;
    }

    if(i!=theLength*3-1)
    {
        newArray[count]=theArray[theLength*3-3];
        count++;
        newArray[count]=theArray[theLength*3-2];
        count++;
        newArray[count]=theArray[theLength*3-1];
        count++;
    }

    outArr.set(null);
    outArr.set(newArray);



}