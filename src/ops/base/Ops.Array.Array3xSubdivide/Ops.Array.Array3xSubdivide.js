op.name="Array3xSubdivide";

var inArr=op.inArray("Points");
var subDivs=op.inValue("Num Subdivs");
var bezier=op.inValueBool("Smooth");

var result=op.outArray("Result");

subDivs.onChange=calc;
bezier.onChange=calc;
inArr.onChange=calc;

function ip(x0,x1,x2,t)//Bezier 
{
    var r =(x0 * (1-t) * (1-t) + 2 * x1 * (1 - t)* t + x2 * t * t);
    return r;
}

var arr=[];

function calc()
{
    if(!inArr.get())return;
    var subd=Math.floor(subDivs.get());
    var inPoints=inArr.get();
    
    if(inPoints.length<3)return;
    
    var i=0;
    var j=0;
    var k=0;

    if(subd>0 && !bezier.get())
    {
        arr.length=(inPoints.length-3)*(subd);

        var count=0;
        for(i=0;i<inPoints.length-3;i+=3)
        {
            for(j=0;j<subd;j++)
            {
                for(k=0;k<3;k++)
                {
                    arr[count]=
                        inPoints[i+k]+
                            ( inPoints[i+k+3] - inPoints[i+k] ) *
                            j/subd
                            ;
                    count++;
                }
            }
        }

        // console.log(" length",count);

    }
    else
    if(subd>0 && bezier.get() )
    {
        arr.length=(inPoints.length-3)*(subd);
        var count=0;

        for(i=3;i<inPoints.length-6;i+=3)
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

                    // points.push(p);
                    arr[count]=p;
                    count++;
                }
            }
        }
        
    }
    
    // op.log('subdiv ',inPoints.length,arr.length);
    // op.log(arr);
    
    result.set(arr);
}
