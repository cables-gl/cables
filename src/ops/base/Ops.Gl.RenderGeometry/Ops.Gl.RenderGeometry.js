op.name="RenderGeometry";

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));

var geometry=op.addInPort(new Port(op,"Geometry",OP_PORT_TYPE_OBJECT));
geometry.ignoreValueSerialize=true;

var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));


var mesh=null;

render.onTriggered=function()
{
    if(mesh) mesh.render(op.patch.cgl.getShader());
    trigger.trigger();
};


geometry.onValueChanged=function()
{
    if(geometry.get()) mesh=new CGL.Mesh(op.patch.cgl,geometry.get());
};

