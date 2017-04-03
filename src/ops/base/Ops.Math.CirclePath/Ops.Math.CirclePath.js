op.name="CirclePath";

var outArr=op.outArray("Points");
var percent=op.inValueSlider('percent',1);
var segments=op.inValue('segments',40);
var radius=op.inValue('radius',1);

radius.onChange=calcArray;
percent.onChange=calcArray;
segments.onChange=calcArray;

function calcArray()
{
    var segs=Math.max(3,Math.floor(segments.get()));
    var points=[];
    
    var count=0;
    for (i=0; i <= segs*percent.get(); i++)
    {
        degInRad = (360/segs)*i*CGL.DEG2RAD;
        posx=Math.cos(degInRad)*radius.get();
        posy=Math.sin(degInRad)*radius.get();

        points.push(posx);
        points.push(posy);
        points.push(0);
    
    }

    outArr.set(null);
    outArr.set(points);
    
}

calcArray();