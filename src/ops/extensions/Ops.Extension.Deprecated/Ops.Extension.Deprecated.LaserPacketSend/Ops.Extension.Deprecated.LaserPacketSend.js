op.name = "LaserPacketSend";

let exec = op.inTrigger("Exec");
let next = op.outTrigger("Next");
// var laserId=op.inValueInt("Laser Id",0);
// var inSpeed=op.inValue("speed",15000);

let outPacket = op.outObject("out packet");
let inPacket = op.inObject("Packet");
let outPackets = op.outValue("num packets");
let outNumPoints = op.outValue("Num Points");

let packets = [];
packets.length = 100;
let index = 0;

let highestLaserId = -1;

inPacket.onChange = function ()
{
    if (inPacket.get())
    {
        let p = inPacket.get();
        highestLaserId = Math.max(highestLaserId, p.laserId);
        packets[index] = p;
        index++;
    }
};

let newPacketArray = [];
let container = { "packets": [] };

exec.onTriggered = function ()
{
    // console.log(highestLaserId,packets.length);
    outPackets.set(index);
    if (index == 0) return;

    let pointCount = 0;

    newPacketArray.length = 0;

    for (let lid = 0; lid <= highestLaserId; lid++)
    {
        let newPacket =
            {
                "points": [],
                "colors": [],
                "laserId": lid,
                "speed": packets[0].speed || 3000,
                "neverDrop": packets[0].neverDrop || 0,
            };

        for (var i = 0; i < index; i++)
        {
            if (packets[i].laserId == lid)
            {
                newPacket.points = newPacket.points.concat(packets[i].points);
                newPacket.colors = newPacket.colors.concat(packets[i].colors);
                newPacket.numPoints = newPacket.points.length / 2;
            }
        }
        if (newPacket.numPoints > 0)
        {
            newPacketArray.push(newPacket);
            pointCount += newPacket.numPoints;
        }

        for (var i = 0; i < newPacket.points.length; i++)
        {
            if (newPacket.points[i] < 0)console.log("LESS THEN ZERO BIATCH");
        }
    }

    outNumPoints.set(pointCount);

    container.packets = newPacketArray;

    outPacket.set(null);
    outPacket.set(container);

    next.trigger();

    index = 0;
    lowestLaserId = -1;
    highestLaserId = -1;
};
