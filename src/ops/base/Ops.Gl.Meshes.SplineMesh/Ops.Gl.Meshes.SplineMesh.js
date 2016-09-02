op.name="SplineMesh";
var render=op.addInPort(new Port(op,"Render",OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"Next",OP_PORT_TYPE_FUNCTION));

var thickness=op.addInPort(new Port(op,"Thickness",OP_PORT_TYPE_VALUE));
var test=op.addInPort(new Port(op,"test",OP_PORT_TYPE_VALUE));

var geomOut=op.addOutPort(new Port(op,"geometry",OP_PORT_TYPE_OBJECT));
geomOut.ignoreValueSerialize=true;



var geom=new CGL.Geometry();
var mesh=null;
var cgl=op.patch.cgl;

render.onTriggered=function()
{
    if(mesh) mesh.render(cgl.getShader());
    trigger.trigger();
};

rebuild();

thickness.onValueChanged=rebuild;
test.onValueChanged=rebuild;
    

function rebuild()
{
    var points=[];
    for(i=0;i<7;i++)
    {
        points.push(Math.random()*2-3);
        points.push(Math.random()*2+3);
        points.push(0);
    }
    
    var geom=CGL.Geometry.LinesToGeom(points);
    geom.center();
    // var geom2=CGL.Geometry.LinesToGeom();
        // geom.merge(geom2);
    
    if(!mesh) mesh=new CGL.Mesh(cgl,geom);
        else mesh.setGeom(geom);

    geomOut.set(null);
    geomOut.set(geom);
}
