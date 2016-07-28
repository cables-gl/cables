op.name="ShuffleArray";

var array=op.addInPort(new Port(op, "array",OP_PORT_TYPE_ARRAY));
var arrayOut=op.addOutPort(new Port(op, "shuffled array",OP_PORT_TYPE_ARRAY));
array.ignoreValueSerialize=true;
arrayOut.ignoreValueSerialize=true;

// function update()
// {
//     if(array.get()) value.set( array.get()[index.get()]);
// }

array.onValueChanged=function()
{
    var a=array.get();
    if(!a)return;
    var j, x, i;
    for (i = a.length; i; i--) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
    arrayOut.set(a);
};
