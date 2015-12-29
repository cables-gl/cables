Op.apply(this, arguments);
var self=this;
var cgl=this.patch.cgl;

this.name='Triangle';
this.render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

this.render.onTriggered=function()
{
    self.mesh.render(cgl.getShader());
    self.trigger.trigger();
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
this.mesh=new CGL.Mesh(cgl,geom);
