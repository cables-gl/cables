const
    numValues=op.inValueInt("numValues",100),
    min=op.inValueFloat("Min",-1),
    max=op.inValueFloat("Max",1),
    seed=op.inValueFloat("random seed"),
    closed=op.inValueBool("Last == First"),
    inInteger=op.inValueBool("Integer",false),
    values=op.outArray("values"),
    outTotalPoints = op.outNumber("Total points"),
    outArrayLength = op.outNumber("Array length");

op.setPortGroup("Value Range",[min,max]);
op.setPortGroup("",[seed,closed]);

values.ignoreValueSerialize=true;

closed.onChange=max.onChange=
    min.onChange=
    numValues.onChange=
    seed.onChange=
    values.onLinkChanged=
    inInteger.onChange=init;

var arr=[];
init();

function init()
{
    Math.randomSeed=seed.get();

    var isInteger=inInteger.get();

    var arrLength = arr.length=Math.floor(Math.abs(numValues.get()*3));

    if(arrLength === 0)
    {
        values.set(null);
        outTotalPoints.set(0);
        outArrayLength.set(0);
        return;
    }

    var minIn = min.get();
    var maxIn = max.get();

    for(var i=0;i<arrLength;i+=3)
    {
        if(!isInteger)
        {
            arr[i+0]=Math.seededRandom() * ( maxIn - minIn ) + minIn ;
            arr[i+1]=Math.seededRandom() * ( maxIn - minIn ) + minIn ;
            arr[i+2]=Math.seededRandom() * ( maxIn - minIn ) + minIn ;
        }
        else
        {
            arr[i+0]=Math.floor(Math.seededRandom() * (( maxIn - minIn )+1) + minIn) ;
            arr[i+1]=Math.floor(Math.seededRandom() * (( maxIn - minIn )+1) + minIn) ;
            arr[i+2]=Math.floor(Math.seededRandom() * (( maxIn - minIn )+1) + minIn) ;
        }
    }

    if(closed.get() && arrLength>3)
    {
        arr[arrLength-3+0]=arr[0];
        arr[arrLength-3+1]=arr[1];
        arr[arrLength-3+2]=arr[2];
    }

    values.set(null);
    values.set(arr);
    outTotalPoints.set(arrLength/3);
    outArrayLength.set(arrLength);
};
