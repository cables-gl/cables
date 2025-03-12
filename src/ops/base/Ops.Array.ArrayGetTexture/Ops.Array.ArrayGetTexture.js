const
    array = op.inArray("array"),
    index = op.inValueInt("index"),
    value = op.outTexture("value");

let last = null;

array.ignoreValueSerialize = true;
value.ignoreValueSerialize = true;

index.onChange =
    array.onChange = update;

op.toWorkPortsNeedToBeLinked(array, value);

const emptyTex = CGL.Texture.getEmptyTexture(op.patch.cgl);

function update()
{
    const arr = array.get();
    let ind = index.get();
    if (ind < 0 || !arr || ind >= arr.length)
    {
        value.setRef(emptyTex);
        return;
    }

    if (arr[ind])
    {
        value.setRef(arr[ind] || emptyTex);
        last = arr[ind];
    }
    else
        value.setRef(emptyTex);
}
