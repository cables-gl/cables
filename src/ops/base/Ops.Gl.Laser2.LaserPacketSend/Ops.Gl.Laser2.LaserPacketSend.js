op.name="LaserPacketSend";

var exec=op.inFunction("Exec");
var laserId=op.inValueInt("Laser Id",0);
var next=op.outFunction("Next");


var outPacket=op.outObject("out packet");

var inPacket=op.inObject("Packet");

var packets=[];
packets.length=100;
var index=0;

inPacket.onChange=function()
{
    if(inPacket.get())
    {
        packets[index]=inPacket.get();
        index++;
    }
};

exec.onTriggered=function()
{
    var newPacket=
        {
            points:[],
            colors:[],
            "speed": "15000",
            "laserId": laserId.get()
        };
        
    for(var i=0;i<index;i++)
    {
        newPacket.points=newPacket.points.concat(packets[i].points);
        newPacket.colors=newPacket.colors.concat(packets[i].colors);
    }

    newPacket.numPoints=newPacket.points.length/2;

    // console.log("newPacket.numPoints",newPacket.numPoints);
    // console.log("index",index);

    outPacket.set(null);
    outPacket.set(newPacket);

    next.trigger();
    index=0;
};