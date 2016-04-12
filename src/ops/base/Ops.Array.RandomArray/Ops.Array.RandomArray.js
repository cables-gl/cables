this.name='RandomArray';

var numValues=this.addInPort(new Port(this, "numValues",OP_PORT_TYPE_VALUE));
var seed=this.addInPort(new Port(this,"random seed"));
var min=this.addInPort(new Port(this,"Min"));
var max=this.addInPort(new Port(this,"Max"));

var values=this.addOutPort(new Port(this, "values",OP_PORT_TYPE_ARRAY));
values.ignoreValueSerialize=true;



numValues.set(100);
min.set(0);
max.set(1);

max.onValueChanged=init;
min.onValueChanged=init;
numValues.onValueChanged=init;
seed.onValueChanged=init;
values.onLinkChanged=init;

init();

function init()
{

    Math.randomSeed=seed.get();
var arr=[];
    arr.length=parseInt(numValues.get()) || 100;
    for(var i=0;i<arr.length;i++)
    {
        arr[i]=Math.seededRandom()* ( max.get() - min.get() ) + parseFloat(min.get()) ;
    }
    
    values.set(null);
    values.set(arr);
}
