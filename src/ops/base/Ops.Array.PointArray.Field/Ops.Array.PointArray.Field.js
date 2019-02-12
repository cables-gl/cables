const
    inNumX=op.inValueInt("Rows",32),
    inNumY=op.inValueInt("Columns",32),
    inWidth=op.inValueInt("Width",2),
    inHeight=op.inValueInt("Height",2),
    inCenter=op.inValueBool("Center",true),
    outArr=op.outArray("Result")
    ;

inNumX.onChange=generate;
inNumY.onChange=generate;
inCenter.onChange=generate;
inWidth.onChange=generate;
inHeight.onChange=generate;

var arr=[];
outArr.set(arr);
generate();

function generate()
{
    const numX=inNumX.get();
    const numY=inNumY.get();
    const stepY=inHeight.get()/numY;
    const stepX=inWidth.get()/numX;

    var i=0;

    var centerX=0;
    var centerY=0;

    if(inCenter.get())
    {
        centerX=inWidth.get()/2;
        centerY=inHeight.get()/2;
    }

    for(var x=0;x<numX;x++)
    {
        for(var y=0;y<numY;y++)
        {
            arr[i++]=stepX*x-centerX;
            arr[i++]=stepY*y-centerY;
            arr[i++]=0;
        }
    }

    outArr.set(null);
    outArr.set(arr);
}