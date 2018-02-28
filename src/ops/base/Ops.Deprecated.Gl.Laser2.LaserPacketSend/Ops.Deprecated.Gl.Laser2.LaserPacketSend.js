op.name="LaserPacketSend";

var exec=op.inFunction("Exec");
var next=op.outFunction("Next");
// var laserId=op.inValueInt("Laser Id",0);
// var inSpeed=op.inValue("speed",15000);




var outPacket=op.outObject("out packet");
var inPacket=op.inObject("Packet");
var outPackets=op.outValue("num packets");
var outNumPoints=op.outValue("Num Points");

var packets=[];
packets.length=100;
var index=0;

var highestLaserId=-1;

inPacket.onChange=function()
{
    if(inPacket.get())
    {
        var p=inPacket.get();
        highestLaserId=Math.max(highestLaserId,p.laserId);
        packets[index]=p;
        index++;
    }
};


var newPacketArray=[];
var container={packets:[]};

exec.onTriggered=function()
{
    // console.log(highestLaserId,packets.length);
    outPackets.set(index);
    if(index==0)return;
    
    var pointCount=0;
    
    newPacketArray.length=0;
    
    for(var lid=0;lid<=highestLaserId;lid++)
    {
        var newPacket=
            {
                "points":[],
                "colors":[],
                "laserId":lid,
                "speed":packets[0].speed||3000,
                "neverDrop":packets[0].neverDrop||0,
            };

        for(var i=0;i<index;i++)
        {
            if(packets[i].laserId==lid)
            {
                newPacket.points=newPacket.points.concat(packets[i].points);
                newPacket.colors=newPacket.colors.concat(packets[i].colors);
                newPacket.numPoints=newPacket.points.length/2;
            }
        }
        if(newPacket.numPoints>0)
        {
            newPacketArray.push(newPacket);
            pointCount+=newPacket.numPoints;
        }

for(var i=0;i<newPacket.points.length;i++)
{
    if(newPacket.points[i]<0)console.log("LESS THEN ZERO BIATCH");
}
        
    }

    outNumPoints.set(pointCount);

    container.packets=newPacketArray;




    outPacket.set(null);
    outPacket.set(container);

    next.trigger();
    
    index=0;
    lowestLaserId=-1;
    highestLaserId=-1;

};