op.name='RandomArray';

var numValues=op.addInPort(new Port(op, "numValues",OP_PORT_TYPE_VALUE));
var seed=op.addInPort(new Port(op,"random seed"));
var min=op.addInPort(new Port(op,"Min"));
var max=op.addInPort(new Port(op,"Max"));
var closed=op.inValueBool("Last == First");

var values=op.addOutPort(new Port(op, "values",OP_PORT_TYPE_ARRAY));
values.ignoreValueSerialize=true;

numValues.set(100);
min.set(-1);
max.set(1);

closed.onChange=max.onChange=init;
min.onChange=init;
numValues.onChange=init;
seed.onChange=init;
values.onLinkChanged=init;

var arr=[];
init();

function init()
{
    Math.randomSeed=seed.get();

    arr.length=Math.floor(numValues.get()*3) || 300;
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
