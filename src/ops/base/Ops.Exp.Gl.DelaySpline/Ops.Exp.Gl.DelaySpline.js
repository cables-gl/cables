op.name="DelaySpline";

var render=op.inFunction("render");
var x=op.inValue("X");
var y=op.inValue("Y");
var z=op.inValue("Z");

var next=op.outFunction("next");
var cgl=op.patch.cgl;

var queue=[];
queue.length=300*3;

render.onTriggered=doRender;

setInterval(store,10);

var geom=null;
var mesh=null;

function store()
{
    queue.shift();
    queue.shift();
    queue.shift();
    
    queue.push(x.get());
    queue.push(y.get());
    queue.push(z.get());
    
    if(!geom)
    {
        geom=new CGL.Geometry();
    
        geom.texCoords.length=0;
        geom.verticesIndices.length=0;
        for(i=0;i<queue;i+=3)
        {
            geom.texCoords.push(0);
            geom.texCoords.push(0);
            geom.verticesIndices.push(i/3);
        }
    }
    
    geom.vertices=queue;

    if(!mesh) mesh=new CGL.Mesh(cgl,geom);
        else mesh.setGeom(geom);

}

function doRender()
{
    var shader=cgl.getShader();
    if(!shader)return;
    if(!mesh)return;

    var oldPrim=shader.glPrimitive;
    shader.glPrimitive=cgl.gl.LINE_STRIP;
    
    cgl.gl.lineWidth(2);
    
    mesh.render(shader);
    shader.glPrimitive=oldPrim;

    next.trigger();
}