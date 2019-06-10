
var inArrays=op.inArray("Array of Arrays");
var index=op.inValueInt("Index");

var result=op.outArray("Result Array");

inArrays.onChange=update;
index.onChange=update;

function update()
{
    var theArray=inArrays.get();
    if(!theArray)
    {
        // op.log('no array');
        return;
    }
    
    var ind=Math.floor(index.get());
    if(ind<0 || ind>theArray.length-1)
    {
        op.log("index wrong");
        return;
    }
    
    result.set(theArray[ind]);
}