op.name="TextureArray";

var outArr=op.addOutPort(new Port(op,"Array",OP_PORT_TYPE_ARRAY));

var num=8;
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
    
    outArr.set(arr);
    console.log(arr);
    console.log('rebuild');
}


for(var i=0;i<num;i++)
{
    var p=op.addInPort(new Port(op,"Texture "+(i),OP_PORT_TYPE_OBJECT)) ;
    p.onLinkChanged=rebuild;
    texturePorts.push(p);
    
}
