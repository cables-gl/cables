    Op.apply(this, arguments);
    var self=this;
    var cgl=self.patch.cgl;

    this.name='TransformMul';
    this.render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
    this.mul=this.addInPort(new Port(this,"mul"));

    this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

    this.render.onTriggered=function()
    {
        var pos=[0,0,0];
        vec3.transformMat4(pos, [0,0,0], cgl.mvMatrix);

        cgl.pushMvMatrix();
        vec3.mul(pos,pos,[self.mul.get(),self.mul.get(),self.mul.get()] );

        mat4.translate(cgl.mvMatrix,cgl.mvMatrix, pos );
        self.trigger.trigger();

        cgl.popMvMatrix();
    };