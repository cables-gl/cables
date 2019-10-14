
const outArr=op.outArray("Result");

const NUM_PORTS=8;

var inArrPorts=[];


for(var i=0;i<NUM_PORTS;i++)
{
    var p=op.inArray("Array "+i);
    p.onChange=update;
    inArrPorts.push(p);
}

function update()
{
    var arr=[];
    var inArrays=[];
    var i=0;


    for(i=0;i<NUM_PORTS;i++)
    {
        var a=inArrPorts[i].get();
        if(a)
        {
            inArrays.push(a);
            if(a.length!=inArrays[0])
            {
                console.log("arrays do not match!");
                outArr.set(null);
                return;
            }
        }
    }

    if(inArrays.length===0)
    {
        console.log("no arrays!");
        outArr.set(null);
        return;
    }

    for(i=0;i<inArrays.length;i++)
    {
        for(var j=0;j<inArrays[0].length;j++)
        {
            arr.push(inArrays[i][j]);
        }

    }

    outArr.set(null);
    outArr.set(arr);
}