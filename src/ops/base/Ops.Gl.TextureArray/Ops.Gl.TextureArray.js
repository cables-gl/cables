var outArr=op.outArray("Array");
var outCount=op.outValue("Count");
outArr.ignoreValueSerialize=true;

const num=15;
var texturePorts=[];
var arr=[];

function rebuild()
{
    var i=0;
    var count=0;
    for(i=0;i<texturePorts.length;i++) if(texturePorts[i].isLinked()) count++;

    arr.length=count;

    count=0;
    for(i=0;i<texturePorts.length;i++)
    {
        if(texturePorts[i].isLinked())
        {
            arr[count]=texturePorts[i].get();
            count++;
        }
    }

    outArr.set(null);
    outArr.set(arr);
    outCount.set(count);
}

for(var i=0;i<num;i++)
{
    var p=op.inTexture("Texture "+i);
    p.onLinkChanged=rebuild;
    p.onChange=rebuild;
    texturePorts.push(p);
}
