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

    var arrLength = arr.length=Math.abs(parseInt(numValues.get())) || 100;
    if(!isInteger)
    {
        for(var i=0;i<arrLength;i++)
        {
            arr[i]=Math.seededRandom()* ( max.get() - min.get() ) + parseFloat(min.get()) ;
        }
    }
    else
    {
        for(var i=0;i<arrLength;i++)
        {
            arr[i]=Math.floor(Math.seededRandom()* ( max.get() - min.get() ) + parseFloat(min.get())) ;
        }
    }

    values.set(null);
    values.set(arr);
    outArrayLength.set(arrLength);
};
