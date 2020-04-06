const
    array=op.inArray("array"),
    index=op.inValueInt("index"),
    value=op.outObject("value");

var last=null;

array.ignoreValueSerialize=true;
value.ignoreValueSerialize=true;

index.onChange=update;
array.onChange=update;

op.toWorkPortsNeedToBeLinked(array,value);

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
        value.set(null);
        value.set(arr[ind]);
        last=arr[ind];
    }
}

