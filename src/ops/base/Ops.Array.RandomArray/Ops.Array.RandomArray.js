const
    numValues=op.inValueInt("numValues"),
    min=op.inValueFloat("Min",0),
    max=op.inValueFloat("Max",1),
    seed=op.inValueFloat("random seed"),
    values=op.outArray("values",100);

values.ignoreValueSerialize=true;
op.setPortGroup("Value Range",[min,max]);

max.onChange=
    min.onChange=
    numValues.onChange=
    seed.onChange=
    values.onLinkChanged=init;

var arr=[];
init();

function init()
{
    Math.randomSeed=seed.get();

    arr.length=Math.abs(parseInt(numValues.get())) || 100;
    for(var i=0;i<arr.length;i++)
    {
        arr[i]=Math.seededRandom()* ( max.get() - min.get() ) + parseFloat(min.get()) ;
    }

    values.set(null);
    values.set(arr);
}
