op.name="SpiralPoints";

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));


var segments=op.inValue("Segments",40);
var freq=op.inValue("Frequency",1);
var radius=op.inValue("Radius",1);
var height=op.inValue("Height");


var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));


var outPoints=op.outArray("Points");

var cgl=op.patch.cgl;


var pos=[];
segments.onChange=calcLater;
radius.onChange=calcLater;
height.onChange=calcLater;
freq.onChange=calcLater;

needsCalc=true;
// calc();

render.onTriggered=doRender;

function doRender()
{
    if(needsCalc)calc();
}

function calcLater()
{
    needsCalc=true;
}

function calc()
{
    needsCalc=false;
    pos.length=0;

    var i=0,degInRad=0;
    var segs=Math.floor(segments.get());
    if(segs<1)segs=1;

    

    for (i=0; i < segs; i++)
    {
        var z=(i/segs)*height.get();
        degInRad = (360/segs)*i*CGL.DEG2RAD;
        pos.push(
            
            Math.sin(degInRad*freq.get())*radius.get(),
            Math.cos(degInRad*freq.get())*radius.get(),
            z
            
            );
    }
    

    outPoints.set(null);
    outPoints.set(pos);
}

