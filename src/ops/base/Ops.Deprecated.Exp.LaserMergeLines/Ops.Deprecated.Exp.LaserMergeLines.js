
const
    exec=op.inTriggerButton("Update"),
    arrays=op.inArray("Arrays"),
    connectPoints=op.inValueInt("num connect points"),

    inLimit=op.inValueSlider("Limit",1.0),


    inX=op.inFloat("Translate X"),
    inY=op.inFloat("Translate Y"),
    inZ=op.inFloat("Translate Z"),

    inR=op.inValueSlider("r"),
    inG=op.inValueSlider("g"),
    inB=op.inValueSlider("b"),
    inMergePoints=op.inArray("Merge Points"),
    inMergeColors=op.inArray("Merge Colors"),
    next=op.outTrigger("Next"),
    outArr=op.outArray("Points"),
    outCol=op.outArray("Colors");

var result=[];
var colors=[];

inMergePoints.ignoreValueSerialize=true;
inMergeColors.ignoreValueSerialize=true;


exec.onTriggered=update;

function update()
{
    const numPointsDivider=connectPoints.get();
    result.length=0;
    colors.length=0;

    const prevPoints=inMergePoints.get();
    const prevColors=inMergeColors.get();

    if(prevPoints && prevColors && (prevPoints.length=prevColors.length      ))
    {
        for(var ii=0;ii<prevPoints.length;ii++)
        {
            colors[ii]=prevColors[ii];
            result[ii]=prevPoints[ii];
        }
    }

    const r=Math.round(inR.get()*255);
    const g=Math.round(inG.get()*255);
    const b=Math.round(inB.get()*255);

    var arrs=arrays.get();
    if(!arrs)return;

    const x=inX.get();
    const y=inY.get();
    const z=inZ.get();

    var count=0;
    var max=0;
    for(var i=0;i<arrs.length;i++)
    {
        max+=arrs[i].length;
    }
    var limit=max*inLimit.get();

    for(var i=0;i<arrs.length;i++)
    {
        if(count>=limit)break;

        if(i==0)
        {
            for(var k=0;k<numPointsDivider;k++)
            {

                var ba=x;
                var bb=y;
                var bc=z;

                result.push(ba,bb,bc);
                colors.push(0,0,0);

            }

        }
        if(!arrs[i])continue;


        for(var j=0;j<arrs[i].length;j+=3)
        {

            count++;
            if(count>=limit)break;

            if(j==0)
            {
                for(var k=0;k<numPointsDivider;k++)
                {
                    result.push(
                        arrs[i][j+0]+x,
                        arrs[i][j+1]+y,
                        arrs[i][j+2]+z);
                    colors.push(0,0,0);
                }
            }

            result.push(
                arrs[i][j+0]+x,
                arrs[i][j+1]+y,
                arrs[i][j+2]+z);
            colors.push(r,g,b);

            if(j==arrs[i].length-3)
            {
                for(var k=0;k<numPointsDivider;k++)
                {
                    result.push(
                        arrs[i][j+0]+x,
                        arrs[i][j+1]+y,
                        arrs[i][j+2]+z);
                    colors.push(0,0,0);
                }
            }
        }
    }

    // if(count>=limit)
    // {
        for(var k=0;k<numPointsDivider;k++)
        {

            var ba=result[result.length-3]+x;
            var bb=result[result.length-2]+y;
            var bc=result[result.length-1]+z;

            result.push(ba,bb,bc);
            colors.push(0,0,0);

        }
    // }


    outArr.set(null);
    outArr.set(result);
    outCol.set(null);
    outCol.set(colors);

    next.trigger();
}

