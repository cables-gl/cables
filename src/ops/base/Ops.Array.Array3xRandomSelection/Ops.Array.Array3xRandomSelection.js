
var inArray=op.inArray("Array");
var inNum=op.inValueInt("Elements",10);
var inSeed=op.inValue("Seed",0);
var result=op.outArray("Result");

var arr=[];
inSeed.onChange=inArray.onChange=inNum.onChange=update;

function update()
{
    if(Math.floor(inNum.get())<0 || !inArray.get())
    {
        result.set(null);
        return;
    }
    
    var oldArr=inArray.get();
    
    arr.length=Math.floor(inNum.get()*3);
    
    // if(arr.length>oldArr.length)arr.length=oldArr.length;
    
    Math.randomSeed=inSeed.get();
    
    for(var i=0;i<inNum.get();i++)
    {
        var index=Math.floor((Math.seededRandom()*oldArr.length/3))*3;
        arr[i*3+0]=oldArr[index+0];
        arr[i*3+1]=oldArr[index+1];
        arr[i*3+2]=oldArr[index+2];
    }
    
    result.set(null);
    result.set(arr);
    
    
}