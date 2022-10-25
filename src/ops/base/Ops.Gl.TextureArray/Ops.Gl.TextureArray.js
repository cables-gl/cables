const
    outArr = op.outArray("Array"),
    outCount = op.outNumber("Count");

outArr.ignoreValueSerialize = true;

const num = 15;
let texturePorts = [];
let arr = [];

function rebuild()
{
    let i = 0;
    let count = 0;
    for (i = 0; i < texturePorts.length; i++) if (texturePorts[i].isLinked()) count++;

    arr.length = count;

    count = 0;
    for (i = 0; i < texturePorts.length; i++)
    {
        if (texturePorts[i].isLinked())
        {
            arr[count] = texturePorts[i].get();
            count++;
        }
    }

    outArr.set(null);
    outArr.set(arr);
    outCount.set(count);
}

for (let i = 0; i < num; i++)
{
    let p = op.inTexture("Texture " + i);
    p.onLinkChanged = rebuild;
    p.onChange = rebuild;
    texturePorts.push(p);
}
