const
    numValues=op.inValueInt("numValues",10),
    min=op.inValueFloat("Min",0),
    max=op.inValueFloat("Max",1),
    seed=op.inValueFloat("random seed"),
    values=op.outArray("values",100),
    outArrayLength = op.outNumber("Array length"),
    inInteger=op.inValueBool("Integer",false);

values.ignoreValueSerialize=true;
op.setPortGroup("Value Range",[min,max]);
op.setPortGroup("",[seed]);

max.onChange=
    min.onChange=
    numValues.onChange=
    seed.onChange=
    values.onLinkChanged=
    inInteger.onChange =init;

var arr=[];
init();

function init()
{
    Math.randomSeed=seed.get();
    var isInteger=inInteger.get();

    var arrLength = arr.length=Math.abs(parseInt(numValues.get()));

    var minIn = min.get();
    var maxIn = max.get();

    if(arrLength===0)
    {
        values.set(null);
        outArrayLength.set(0);
        return;
    }
    if(!isInteger)
    {
        for(var i=0;i<arrLength;i++)
        {
            arr[i]=Math.seededRandom()* ( maxIn - minIn ) + minIn ;
        }
    }
    else
    {
        for(var i=0;i<arrLength;i++)
        {
            arr[i]=Math.floor(Math.seededRandom()* ( (maxIn - minIn) + 1 ) + minIn);
        }
    }

    values.set(null);
    values.set(arr);
    outArrayLength.set(arrLength);
};
