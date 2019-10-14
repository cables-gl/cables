
const outArr=op.outArray("Result");

const NUM_PORTS=8;

var inArrPorts=[];
var showingError=false;

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
            if(a.length!=inArrays[0].length)
            {
                if(!showingError)op.uiAttr({error:"Arrays do not have the same length !"});
                outArr.set(null);
                showingError=true;
                return;
            }
        }
    }

    if(inArrays.length===0)
    {
        if(!showingError)op.uiAttr({error:"No Valid Arrays"});
        outArr.set(null);
        showingError=true;
        return;
    }

    if(showingError) op.uiAttr({error:null});
    showingError=false;

    for(var j=0;j<inArrays[0].length;j++)
    {
        for(i=0;i<inArrays.length;i++)
        {
            arr.push(inArrays[i][j]);
        }

    }

    outArr.set(null);
    outArr.set(arr);
}