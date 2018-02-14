
var exec=op.inFunction("Update");
var inArr1=op.inArray("Array 1");
var inArr2=op.inArray("Array 2");

var inProgress=op.inValueSlider("Progress");


var arrOut=op.outArray("Result");
var resultArr=[];
var indexArray=[];

inArr2.onChange=updateArr2;
inArr1.onChange=updateArr1;

function updateArr1()
{
    if(!inArr1.get())return;
    resultArr.length=inArr1.get().length;
    // updateArr2();
};

function updateArr2()
{
    if(!inArr2.get())return;
    // resultArr.length=inArr1.get().length;
    indexArray.length=inArr2.get().length/3;
    
    var arr2=inArr2.get();
    
    for(var i=0;i<indexArray.length;i+=3)
    {
        var index2=Math.floor(arr2.length/3*Math.random());
        // indexArray[i+0]=arr2[index2*3+0];
        // indexArray[i+1]=arr2[index2*3+1];
        // indexArray[i+2]=arr2[index2*3+2];
        indexArray[i/3]=index2*3;
        // indexArray[i+1]=arr2[index2*3+1];
        // indexArray[i+2]=arr2[index2*3+2];
    }
    
    // arrOut.set(null);
    // arrOut.set(resultArr);
    // updateArr1();
};


exec.onTriggered=function()
{
    var perc=inProgress.get();

    var arr1=inArr1.get();
    var arr2=inArr2.get();
    
    var l1=0;
    var l2=0;
    if(arr1)l1=arr1.length;
    if(arr2)l2=arr2.length;
    
    var l=Math.min(l1,l2);
    

    for(var i=0;i<l;i+=3)
    {
        val1=arr1[i];
        val2=arr2[ indexArray[(i/3)] ];
        resultArr[i]=( (val2-val1)*perc+val1 );

        val1=arr1[i+1];
        val2=arr2[ indexArray[(i/3)]+1 ];
        resultArr[i+1]=( (val2-val1)*perc+val1 );

        val1=arr1[i+2];
        val2=arr2[ indexArray[(i/3)]+2 ];
        resultArr[i+2]=( (val2-val1)*perc+val1 );
    }

    arrOut.set(null);
    arrOut.set(resultArr);


};