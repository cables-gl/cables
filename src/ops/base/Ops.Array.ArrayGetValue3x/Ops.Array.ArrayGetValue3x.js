op.name="ArrayGetValue3x";

var pArr=op.inArray("Array");
// var pIndex=op.inValue("Index");
var pIndex=op.inValueInt("Index");

var outX=op.outValue("X");
var outY=op.outValue("Y");
var outZ=op.outValue("Z");


pArr.onChange=update;
pIndex.onChange=update;

function update()
{
    var arr=pArr.get();
    if(!arr)
    {
        outX.set(0);
        outY.set(0);
        outZ.set(0);
        return;
    }
    var ind=Math.min(arr.length-3,pIndex.get()*3);
    if(arr)
    {
        outX.set(arr[ind+0]);
        outY.set(arr[ind+1]);
        outZ.set(arr[ind+2]);
    }
}