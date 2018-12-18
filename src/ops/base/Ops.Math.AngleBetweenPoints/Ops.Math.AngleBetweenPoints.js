var outAngle=op.outValue("Angle",0);

var p1x=op.inValue("Point 1 X");
var p1y=op.inValue("Point 1 Y");

var p2x=op.inValue("Point 2 X");
var p2y=op.inValue("Point 2 Y");


p1x.onChange=update;
p2x.onChange=update;
p1y.onChange=update;
p2y.onChange=update;

function update()
{
    var theta = Math.atan2(
        p1y.get() - p2y.get(), 
        p1x.get() - p2x.get());

    var angle=theta*180/Math.PI*-1;

    outAngle.set(angle);
}
