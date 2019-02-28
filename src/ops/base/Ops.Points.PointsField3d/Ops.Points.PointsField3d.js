const numx=op.inValueInt("num x",5),
    numy=op.inValueInt("num y",5),
    numz=op.inValueInt("num z",5),
    mul=op.inValue("mul",1),
    center=op.inValueBool("center",true),
    outArray = op.outArray("Array out");
const idx=op.outValue("Total points");

var newArr=[];
outArray.set(newArr);

numx.onChange=
numy.onChange=
numz.onChange=
mul.onChange=
center.onChange=function()
{
    newArr.length = 0;

    var subX=0;
    var subY=0;
    var subZ=0;

    if(center.get())
    {
        subX=( (numx.get()-1)*mul.get())/2.0;
        subY=( (numy.get()-1)*mul.get())/2.0;
        subZ=( (numz.get()-1)*mul.get())/2.0;
    }
    var xTemp = 0;
    var yTemp = 0;
    var zTemp = 0;

    var m=mul.get();

    for(var z=0;z<numz.get();z++)
    {
        zTemp = (z*m) - subZ;

        for(var y=0;y<numy.get();y++)
        {
            yTemp = (y*m) - subY;

            for(var x=0;x<numx.get();x++)
            {
                xTemp = (x*m) - subX;

                newArr.push(xTemp);
                newArr.push(yTemp);
                newArr.push(zTemp);

            }
        }
    }
    idx.set(x*y*z);
    outArray.set(null);
    outArray.set(newArr);
};