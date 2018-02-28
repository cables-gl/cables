
var outArr=op.addOutPort(new Port(op,"Array",OP_PORT_TYPE_ARRAY));
var outCount=op.addOutPort(new Port(op,"Count",OP_PORT_TYPE_VALUE));

var num=15;
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
    // console.log(arr);
    // console.log('rebuild');
}


for(var i=0;i<num;i++)
{
    var p=op.addInPort(new Port(op,"Texture "+(i),OP_PORT_TYPE_OBJECT)) ;
    p.onLinkChanged=rebuild;
    p.onValueChanged=rebuild;
    texturePorts.push(p);
}
