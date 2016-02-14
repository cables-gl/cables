var cgl=this.patch.cgl;

this.name='translate';
var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

var x=this.addInPort(new Port(this,"x"));
var y=this.addInPort(new Port(this,"y"));
var z=this.addInPort(new Port(this,"z"));
x.set(0.0);
y.set(0.0);
z.set(0.0);

var vec=vec3.create();

var self=this;


render.onTriggered=function()
{
        self.updateAnims();
    vec3.set(vec, x.get(),y.get(),z.get());
    cgl.pushMvMatrix();
    mat4.translate(cgl.mvMatrix,cgl.mvMatrix, vec);
    self.trigger.trigger();
    cgl.popMvMatrix();
};
