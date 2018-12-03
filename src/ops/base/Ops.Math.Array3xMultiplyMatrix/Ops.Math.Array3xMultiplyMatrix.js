var exec=op.inTrigger("Update");
var inArr=op.inArray("Array");
var inMat=op.inArray("Matrix");

var outArr=op.outArray("Result");

var theArr=[];
exec.onTriggered=function()
{
    var arr=inArr.get();
    if(!arr)
    {
        outArr.set(null);
        return;
    }
    theArr.length=arr.length;
    var mMat=inMat.get();
    var vec=vec4.create();
    vec[3]=1;
    
    for(var i=0;i<arr.length/3;i++)
    {
        vec[0]=arr[i*3+0];
        vec[1]=arr[i*3+1];
        vec[2]=arr[i*3+2];
        
        vec3.transformMat4(vec, vec, mMat);
        
        theArr[i*3+0]=vec[0];
        theArr[i*3+1]=vec[1];
        theArr[i*3+2]=vec[2];
    }
    
    outArr.set(null);
    outArr.set(theArr);
    
};
