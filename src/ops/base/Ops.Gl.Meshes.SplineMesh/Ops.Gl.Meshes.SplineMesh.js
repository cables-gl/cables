op.name="SplineMesh";
var render=op.addInPort(new Port(op,"Render",OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"Next",OP_PORT_TYPE_FUNCTION));

var thick=op.inValue("Thickness");
var test=op.addInPort(new Port(op,"test",OP_PORT_TYPE_VALUE));

var calcNormals=op.inValueBool("Calculate Normals",false);

var geomOut=op.addOutPort(new Port(op,"geometry",OP_PORT_TYPE_OBJECT));
geomOut.ignoreValueSerialize=true;

var inPoints=op.inArray('points');

var geom=new CGL.Geometry("splinemesh");
var mesh=null;
var cgl=op.patch.cgl;

render.onTriggered=function()
{
    if(needsBuild)doRebuild();
    if(mesh) mesh.render(cgl.getShader());
    trigger.trigger();
};

rebuild();

test.onValueChanged=rebuild;
inPoints.onChange=rebuild;
thick.onChange=rebuild;
var geom=null;

function rebuild()
{
    needsBuild=true;
}

function doRebuild()
{
    var points=inPoints.get()||[];
    if(!points.length)return;
    // for(i=0;i<7;i++)
    // {
    //     points.push(Math.random()*2-3);
    //     points.push(Math.random()*2+3);
    //     points.push(0);
    // }

    geom=CGL.Geometry.LinesToGeom(points,{"thickness":thick.get()},geom);

    if(!mesh) mesh=new CGL.Mesh(cgl,geom);
        else 
        {
            mesh.addVertexNumbers=true;
            mesh.setGeom(geom);
        }

    geomOut.set(null);
    geomOut.set(geom);
    

    if(calcNormals.get())geom.calculateNormals({forceZUp:true});
needsBuild=false;
}
