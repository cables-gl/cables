
var numValues=op.inValueInt("numValues");

var values=op.addOutPort(new Port(op, "values",CABLES.OP_PORT_TYPE_ARRAY));
values.ignoreValueSerialize=true;

numValues.set(100);

numValues.onValueChanged=init;

var arr=[];
init();

function init()
{
    arr.length=Math.abs(Math.floor(numValues.get())) || 100;
    for(var i=0;i<arr.length;i++)arr[i]=0;

    values.set(null);
    values.set(arr);
}
