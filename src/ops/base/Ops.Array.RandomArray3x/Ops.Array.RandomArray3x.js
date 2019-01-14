const
    numValues=op.inValueInt("numValues",100),
    min=op.inValueFloat("Min",-1),
    max=op.inValueFloat("Max",1),
    seed=op.inValueFloat("random seed"),
    closed=op.inValueBool("Last == First"),
    values=op.outArray("values");

op.setPortGroup("Value Range",[min,max])

values.ignoreValueSerialize=true;

closed.onChange=max.onChange=
    min.onChange=
    numValues.onChange=
    seed.onChange=
    values.onLinkChanged=init;

var arr=[];
init();

function init()
{
    Math.randomSeed=seed.get();

    arr.length=Math.floor(Math.abs(numValues.get()*3)) || 300;
    for(var i=0;i<arr.length;i+=3)
    {
        arr[i+0]=Math.seededRandom() * ( max.get() - min.get() ) + min.get() ;
        arr[i+1]=Math.seededRandom() * ( max.get() - min.get() ) + min.get() ;
        arr[i+2]=Math.seededRandom() * ( max.get() - min.get() ) + min.get() ;
    }

    if(closed.get())
    {
        arr[arr.length-3+0]=arr[0];
        arr[arr.length-3+1]=arr[1];
        arr[arr.length-3+2]=arr[2];
    }

    values.set(null);
    values.set(arr);
}
