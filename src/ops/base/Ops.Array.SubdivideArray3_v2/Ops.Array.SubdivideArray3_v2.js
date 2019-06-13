var inArr=op.inArray("Points");
var subDivs=op.inValue("Num Subdivs",5);
var bezier=op.inValueBool("Smooth",true);
var bezierEndPoints=op.inValueBool("Bezier Start/End Points",true);

var result=op.outArray("Result");

op.toWorkPortsNeedToBeLinked(inArr);

subDivs.onChange=calc;
bezier.onChange=calc;
inArr.onChange=calc;
bezierEndPoints.onChange=calc;

function ip(x0,x1,x2,t)//Bezier
{
    var r =(x0 * (1-t) * (1-t) + 2 * x1 * (1 - t)* t + x2 * t * t);
    return r;
}

var arr=[];

function calc()
{
    if(!inArr.get())
    {
        result.set(null);
        return;
    }
    const subd=Math.floor(subDivs.get());
    var inPoints=inArr.get();

    if(inPoints.length<3)return;

    let i=0;
    let j=0;
    let k=0;
    let count=0;

    if(subd>0 && !bezier.get())
    {
        const newLen=(inPoints.length-3)*subd+3;
        if(newLen!=arr.length)
        {
            op.log("resize subdiv arr");
            arr.length=newLen;
        }

        count=0;
        for(i=0;i<inPoints.length-3;i+=3)
        {
            for(j=0;j<subd;j++)
            {
                for(k=0;k<3;k++)
                {
                    arr[count]=
                        inPoints[i+k]+ ( inPoints[i+k+3] - inPoints[i+k] ) * j/subd ;
                    count++;
                }
            }
        }
        arr[newLen-3]=inPoints[inPoints.length-3];
        arr[newLen-2]=inPoints[inPoints.length-2];
        arr[newLen-1]=inPoints[inPoints.length-1];
    }
    else
    if(subd>0 && bezier.get() )
    {
        var newLen=(inPoints.length-6)*(subd-1);
        if(bezierEndPoints.get())newLen+=6;

        if(newLen!=arr.length) arr.length=Math.floor(Math.abs(newLen));
        count=0;

        if(bezierEndPoints.get())
        {
            arr[0]=inPoints[0];
            arr[1]=inPoints[1];
            arr[2]=inPoints[2];
            count=3;
        }

        for(i=3;i<inPoints.length-3;i+=3)
        {
            for(j=0;j<subd;j++)
            {
                for(k=0;k<3;k++)
                {
                    var p=ip(
                            (inPoints[i+k-3]+inPoints[i+k])/2,
                            inPoints[i+k+0],
                            (inPoints[i+k+3]+inPoints[i+k+0])/2,
                            j/subd
                            );
                    arr[count]=p;
                    count++;
                }
            }
        }

        if(bezierEndPoints.get())
        {
            arr[count-0]=inPoints[inPoints.length-3];
            arr[count+1]=inPoints[inPoints.length-2];
            arr[count+2]=inPoints[inPoints.length-1];
        }
    }

    result.set(null);
    result.set(arr);
}
