
var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));

var draw=op.inValueBool("Draw",true);
var segments=op.inValue("Segments",40);
var freq=op.inValue("Frequency",1);
var radius=op.inValue("Radius",1);
var radiusEnd=op.inValue("Radius End",1);
var height=op.inValue("Height");

var next=op.outFunction("Next");
var outPoints=op.outArray("Points");

var cgl=op.patch.cgl;
var pos=[];
var needsCalc=true;
var mesh=null;

segments.onChange=calcLater;
radius.onChange=calcLater;
height.onChange=calcLater;
freq.onChange=calcLater;
radiusEnd.onChange=calcLater;
draw.onChange=calcLater;

render.onTriggered=doRender;

function doRender()
{
    if(needsCalc)calc();
    
    if(mesh)
    {
        var shader=cgl.getShader();
        if(!shader)return;
        var oldPrim=shader.glPrimitive;
        shader.glPrimitive=cgl.gl.LINE_STRIP;
        mesh.render(shader);
        shader.glPrimitive=oldPrim;
    }
    
    next.trigger();
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
        var perc=(i/segs);
        var z=perc*height.get();
        var rad=(perc*radiusEnd.get())+((1.0-perc)*radius.get());
        degInRad = (360/segs)*i*CGL.DEG2RAD;
        pos.push(
            Math.sin(degInRad*freq.get())*rad,
            Math.cos(degInRad*freq.get())*rad,
            z );
    }

    if(draw.get())
    {
        var buff=new Float32Array(pos);
        var geom=new CGL.Geometry("helix");
        geom.vertices=buff;

        mesh=new CGL.Mesh(cgl,geom);
    }
    else mesh=null;

    outPoints.set(null);
    outPoints.set(pos);
}

