const
    inNumX=op.inValueInt("Rows",32),
    inNumY=op.inValueInt("Columns",32),
    inWidth=op.inValueInt("Width",2),
    inHeight=op.inValueInt("Height",2),
    inCenter=op.inValueBool("Center",true),
    outArr=op.outArray("Result"),
    outTotalPoints = op.outNumber("Total points"),
    outArrayLength = op.outNumber("Array length"),
    outRowNums=op.outArray("Row Numbers"),
    outColNums=op.outArray("Column Numbers");

inNumX.onChange=generate;
inNumY.onChange=generate;
inCenter.onChange=generate;
inWidth.onChange=generate;
inHeight.onChange=generate;

var arr=[];
var arrRowNums=[];
var arrColNums=[];
outArr.set(arr);
generate();

function generate()
{
    arr.length = 0;
    const numX=inNumX.get();
    const numY=inNumY.get();
    const stepY=inHeight.get()/(numY-1);
    const stepX=inWidth.get()/(numX-1);

    var i=0;

    var centerX=0;
    var centerY=0;

    if(inCenter.get())
    {
        centerX=(inWidth.get())/2;
        centerY=inHeight.get()/2;
    }

    const l=Math.floor(numX)*Math.floor(numY)*3;

    arr.length = l;
    arrColNums.length = arrRowNums.length = l/3;

    for(var x=0;x<numX;x++)
    {
        for(var y=0;y<numY;y++)
        {
            arrColNums[i/3]=x;
            arrRowNums[i/3]=y;

            arr[i++]=stepX*x-centerX;
            arr[i++]=stepY*y-centerY;
            arr[i++]=0;

        }
    }

    outRowNums.set(null);
    outRowNums.set(arrRowNums);

    outColNums.set(null);
    outColNums.set(arrColNums);

    outArr.set(null);
    outArr.set(arr);
    outTotalPoints.set(arr.length/3);
    outArrayLength.set(arr.length);
}