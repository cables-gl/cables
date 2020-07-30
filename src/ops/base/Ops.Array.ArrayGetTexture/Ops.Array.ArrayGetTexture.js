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

const emptyTex=CGL.Texture.getEmptyTexture(op.patch.cgl);

function update()
{
    if(index.get()<0)
    {
        value.set( emptyTex);
        return;
    }

    var arr=array.get();
    if(!arr)
    {
        value.set( emptyTex);
        return;
    }

    var ind=index.get();
    if(ind>=arr.length)
    {
        value.set( emptyTex);
        return;
    }
    if(arr[ind])
    {
        value.set(emptyTex);
        value.set(arr[ind]);
        last=arr[ind];
    }
}

