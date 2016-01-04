var cgl=this.patch.cgl;

this.name='Triangle';
var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

render.onTriggered=function()
{
    mesh.render(cgl.getShader());
    trigger.trigger();
};

var geom=new CGL.Geometry();
geom.vertices = [
     0.0,  1.0,  0.0,
    -1.0,  -1.0,  0.0,
     1.0, -1.0,  0.0
];

geom.verticesIndices = [
    0, 1, 2
];
var mesh=new CGL.Mesh(cgl,geom);
