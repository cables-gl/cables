const
    exe=op.inTrigger("Exe"),
    maxDepth=op.inValue("max Depth",4),
    deeper=op.inValueSlider("Possibility",0.5),
    seed=op.inValue("Seed",5711),
    inScale=op.inValueSlider("Scale",1),
    width=op.inValue("Width",4),
    height=op.inValue("Height",3),
    outPosArr=op.outArray("Positions"),
    outScaleArr=op.outArray("Scalings"),
    outArrayLength=op.outNumber("Array Length"),
    outArrayPoints=op.outNumber("Total Points");

const cgl=op.patch.cgl;
var needsChange=true ;
var globalScale=1;
var vPos=vec3.create();
var vScale=vec3.create();
var hhalf=0;
var whalf=0;
var index=0;
var arrPos=[];
var arrScale=[];

var count=0;


maxDepth.onChange=
    deeper.onChange=
    seed.onChange=
    inScale.onChange=
    width.onChange=
    height.onChange=
    function()
    {
        needsChange=true;
    };

function drawSquare(x,y,depth,scale)
{
    var godeeper=Math.seededRandom()>deeper.get()*0.9;

    if(depth>maxDepth.get())godeeper=false;

    if(godeeper)
    {
        depth++;
        var st=1/(depth*depth);

        for(var _x=0;_x<2;_x++)
        {
            for(var _y=0;_y<2;_y++)
            {
                var xx=_x*scale/2;
                var yy=_y*scale/2;

                drawSquare(
                    x+xx-scale/4,
                    y+yy-scale/4,
                    depth,
                    scale/2*globalScale);

            }
        }
    }
    else
    {
        // cgl.pushModelMatrix();
        vec3.set(vScale,scale,scale,scale);
        vec3.set(vPos,x-whalf+0.5,y-hhalf+0.5,0);
        index++;
        // outIndex.set(index);
        // outDepth.set(depth);

        // mat4.translate(cgl.mMatrix,cgl.mMatrix,vPos);
        // mat4.scale(cgl.mMatrix,cgl.mMatrix,vScale);

        arrPos[count*3+0]=vPos[0];
        arrPos[count*3+1]=vPos[1];
        arrPos[count*3+2]=vPos[2];

        arrScale[count*3+0]=vScale[0];
        arrScale[count*3+1]=vScale[1];
        arrScale[count*3+2]=vScale[2];

        count++;
        // next.trigger();

        // cgl.popModelMatrix();
    }
}

exe.onTriggered=function()
{
    if(!needsChange)return;

    needsChange=false;
    index=0;
    Math.randomSeed=seed.get();

    whalf=width.get()/2;
    hhalf=height.get()/2;

    globalScale=inScale.get();

    arrPos.length=0;
    arrScale.length=0;
    count=0;

    for(var x=0;x<width.get();x++)
    {
        for(var y=0;y<height.get();y++)
        {
            drawSquare(x,y,0,globalScale);
            var sc=1;
        }
    }


    outArrayLength.set(arrPos.length);
    outArrayPoints.set(arrPos.length/3);

    outPosArr.set(null);
    outPosArr.set(arrPos);
    outScaleArr.set(null);
    outScaleArr.set(arrScale);



};








