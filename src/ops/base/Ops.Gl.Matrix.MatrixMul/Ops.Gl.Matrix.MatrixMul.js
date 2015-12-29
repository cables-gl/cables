Op.apply(this, arguments);
var self=this;
var cgl=self.patch.cgl;
this.name='matrix';
this.render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

this.matrix=this.addInPort(new Port(this,"matrix"),OP_PORT_TYPE_ARRAY);

this.render.onTriggered=function()
{
    cgl.pushMvMatrix();
    mat4.multiply(cgl.mvMatrix,cgl.mvMatrix,self.matrix.get());
    self.trigger.trigger();
    cgl.popMvMatrix();
};

this.matrix.set( [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] );
