op.name="LaserPacket";


var exe=op.inFunctionButton("Send");


var inPoints=op.inArray("Points");
var inColors=op.inArray("Colors");


var objOut=op.outObject("Packet");

// inPoints.onChange=send;
// inColors.onChange=send;
exe.onTriggered=send;

function send()
{
    var i=0;
    
    var icolors=inColors.get();
    var colors=[];
    
    if(!icolors)
    {
        colors=[255,0,0];
    }
    else
    {
        for(i=0;i<icolors.length;i++)
        {
            colors[i]=Math.round( icolors[i]*255);
        }
        
    }

    var points=inPoints.get();
    if(!points)
    {
        points=[0,0,1000,1000,0,1000,1000,0];    
    }
    else
    {
        for(i=0;i<points.length;i++)
        {
            points[i]=Math.round(points[i]);
        }
        
    }
    
    var packet=
        {
            "points":points,
            "colors":colors,
            "numPoints": points.length/2,
            "speed": "7000",
            "laserId": "1"
        };
        



    objOut.set(packet);


}