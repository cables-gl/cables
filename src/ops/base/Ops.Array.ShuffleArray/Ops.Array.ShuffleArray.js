op.name="ShuffleArray";

var array=op.addInPort(new Port(op, "array",OP_PORT_TYPE_ARRAY));
var arrayOut=op.addOutPort(new Port(op, "shuffled array",OP_PORT_TYPE_ARRAY));
array.ignoreValueSerialize=true;
arrayOut.ignoreValueSerialize=true;


var arr=[];

array.onValueChanged=function()
{
    
    var a=array.get();
    
    if(!a)return;
    if(arr.length!=a.length)
    {
        arr.length=a.length;
    }
    
    var j, x, i;
    
    for (i=0;i<a.length;i++) {
        arr[i]=a[i];
    }
    
    for (i=0;i<a.length;i++) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        arr[i - 1] = arr[j];
        arr[j] = x;
    }
    
    arrayOut.set(null);
    arrayOut.set(arr);
};
