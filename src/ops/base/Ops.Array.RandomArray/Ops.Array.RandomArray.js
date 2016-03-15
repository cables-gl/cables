this.name='RandomArray';

var numValues=this.addInPort(new Port(this, "numValues",OP_PORT_TYPE_VALUE));
var seed=this.addInPort(new Port(this,"random seed"));
var min=this.addInPort(new Port(this,"Min"));
var max=this.addInPort(new Port(this,"Max"));
min.set(1);
max.set(1);
var values=this.addOutPort(new Port(this, "values",OP_PORT_TYPE_ARRAY));
var arr=[];


var init = function()
{

    Math.randomSeed=seed.get();
    
 


    arr.length=parseInt(numValues.get()) || 100;
    for(var i=0;i<arr.length;i++)
    {
        arr[i]=Math.seededRandom()* ( max.get() - min.get() ) + parseFloat(min.get()) ;//Math.random();
    }
    values.val=arr;
};

max.onValueChanged=init;
min.onValueChanged=init;
numValues.onValueChanged=init;
seed.onValueChanged=init;

numValues.set(100);
