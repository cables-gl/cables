op.name='RandomArray';

var numValues=op.addInPort(new Port(op, "numValues",OP_PORT_TYPE_VALUE));
var seed=op.addInPort(new Port(op,"random seed"));
var min=op.addInPort(new Port(op,"Min"));
var max=op.addInPort(new Port(op,"Max"));

var values=op.addOutPort(new Port(op, "values",OP_PORT_TYPE_ARRAY));
values.ignoreValueSerialize=true;

numValues.set(100);
min.set(0);
max.set(1);

max.onValueChanged=init;
min.onValueChanged=init;
numValues.onValueChanged=init;
seed.onValueChanged=init;
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
