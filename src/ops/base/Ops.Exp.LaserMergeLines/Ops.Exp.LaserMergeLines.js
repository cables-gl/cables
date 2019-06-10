
const
    exec=op.inTriggerButton("Update"),
    arrays=op.inArray("Arrays"),
    outArr=op.outArray("Points"),
    connectPoints=op.inValueInt("num connect points"),
    inR=op.inValueSlider("r"),
    inG=op.inValueSlider("g"),
    inB=op.inValueSlider("b"),
    outCol=op.outArray("Colors");

var result=[];
var colors=[];

exec.onTriggered=update;

function update()
{
    const numPointsDivider=connectPoints.get();
    result.length=0;
    colors.length=0;

    const r=Math.round(inR.get()*255);
    const g=Math.round(inG.get()*255);
    const b=Math.round(inB.get()*255);

    var arrs=arrays.get();
    if(!arrs)return;

    for(var i=0;i<arrs.length;i++)
    {
        if(!arrs[i])continue;
        for(var j=0;j<arrs[i].length;j+=3)
        {

            if(j==0)
            {
                for(var k=0;k<numPointsDivider;k++)
                {
                    result.push(
                        arrs[i][j+0],
                        arrs[i][j+1],
                        arrs[i][j+2]);
                    colors.push(0,0,0);
                }
            }

            result.push(
                arrs[i][j+0],
                arrs[i][j+1],
                arrs[i][j+2]);
            colors.push(r,g,b)


            if(j==arrs[i].length-3)
            {
                for(var k=0;k<numPointsDivider;k++)
                {
                    result.push(
                        arrs[i][j+0],
                        arrs[i][j+1],
                        arrs[i][j+2]);
                    colors.push(0,0,0);

                }

            }

        }


    }

    outArr.set(null);
    outArr.set(result);
    outCol.set(null);
    outCol.set(colors);
}

