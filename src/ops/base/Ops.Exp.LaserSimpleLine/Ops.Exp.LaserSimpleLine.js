const x1=op.inValue("X 1");
const y1=op.inValue("Y 1");
const z1=op.inValue("Z 1");

const x2=op.inValue("X 2",1);
const y2=op.inValue("Y 2",1);
const z2=op.inValue("Z 2",1);

const inSubdivs=op.inInt("Subdivs",10);

const outArr=op.outArray("Array");

const cgl=op.patch.cgl;


x1.onChange=y1.onChange=z1.onChange=update;
x2.onChange=y2.onChange=z2.onChange=update;


var arr=[0,0,0,0,0,0];
var subArr=[];
var arrarr=[subArr];

update();

function subd(subdivs,inPoints)
{
    var count=0;
    const newLen=(inPoints.length-3)*subdivs+3;
    if(newLen!=subArr.length)
    {
        op.log("resize subdivsiv subArr");
        subArr.length=newLen;
    }

    count=0;
    for(var i=0;i<inPoints.length-3;i+=3)
    {
        for(var j=0;j<subdivs;j++)
        {
            for(var k=0;k<3;k++)
            {
                subArr[count]=
                    inPoints[i+k]+ ( inPoints[i+k+3] - inPoints[i+k] ) * j/subdivs ;
                count++;
            }
        }
    }
    subArr[newLen-3]=inPoints[inPoints.length-3];
    subArr[newLen-2]=inPoints[inPoints.length-2];
    subArr[newLen-1]=inPoints[inPoints.length-1];

}


function update()
{
    arr[0]=x1.get();
    arr[1]=y1.get();
    arr[2]=z1.get();
    arr[3]=x2.get();
    arr[4]=y2.get();
    arr[5]=z2.get();

    subd(inSubdivs.get(),arr);


    outArr.set(null);
    outArr.set(arrarr);
}