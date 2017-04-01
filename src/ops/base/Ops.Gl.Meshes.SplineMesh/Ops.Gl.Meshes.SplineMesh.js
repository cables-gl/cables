op.name="SplineMesh";

var render=op.addInPort(new Port(op,"Render",OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"Next",OP_PORT_TYPE_FUNCTION));
var thick=op.inValue("Thickness");
var inStart=op.inValueSlider("Start");
var inLength=op.inValueSlider("Length",1);
var calcNormals=op.inValueBool("Calculate Normals",false);
var geomOut=op.addOutPort(new Port(op,"geometry",OP_PORT_TYPE_OBJECT));

geomOut.ignoreValueSerialize=true;

var inPoints=op.inArray('points');

var geom=new CGL.Geometry("splinemesh");
var cgl=op.patch.cgl;

var mesh=null;
var geom=null;
var needsBuild=true;

inPoints.onChange=rebuild;
thick.onChange=rebuild;

render.onTriggered=function()
{
    if(needsBuild)doRebuild();
    if(inLength.get()===0)return;
    
    if(mesh)
    {
        mesh._bufVertexAttrib.startItem=Math.floor( inStart.get()*(geom.vertices.length/18))*6;
        mesh._bufVertexAttrib.numItems=Math.floor( Math.min(1,inLength.get()+inStart.get()) * (geom.vertices.length/3)); // OK
        mesh.render(cgl.getShader());
    }
    trigger.trigger();
};

function rebuild()
{
    needsBuild=true;
}

function doRebuild()
{
    var points=inPoints.get()||[];
    if(!points.length)return;

    geom=CGL.Geometry.LinesToGeom(points,
        {
            "thickness":thick.get(),
            "start":10,
            "end":30,
        },geom);

    if(!mesh) mesh=new CGL.Mesh(cgl,geom);

    geomOut.set(null);
    geomOut.set(geom);

    mesh.addVertexNumbers=true;
    mesh.setGeom(geom);
    mesh._setVertexNumbers();

    if(calcNormals.get())geom.calculateNormals({forceZUp:true});

    needsBuild=false;
}
