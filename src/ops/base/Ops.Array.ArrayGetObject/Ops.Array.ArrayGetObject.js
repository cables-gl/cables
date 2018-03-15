
var array=op.addInPort(new Port(op, "array",OP_PORT_TYPE_ARRAY));
var index=op.addInPort(new Port(op, "index",OP_PORT_TYPE_VALUE,{type:'int'}));
var value=op.addOutPort(new Port(op, "value",OP_PORT_TYPE_OBJECT));
array.ignoreValueSerialize=true;
value.ignoreValueSerialize=true;


var last=null;

function update()
{
    if(index.get()<0)
    {
        value.set( null);
        return;
    }

    var arr=array.get();
    if(!arr)
    {
        value.set( null);
        return;
    }

    var ind=index.get();
    if(ind>=arr.length)
    {
        value.set( null);
        return;
    }
    if(arr[ind])
    {

        value.set( arr[ind]);
        last=arr[ind];
    }
}

index.onValueChanged=update;
array.onValueChanged=update;
