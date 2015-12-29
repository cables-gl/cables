    Op.apply(this, arguments);
    var self=this;
    var cgl=self.patch.cgl;
    this.name='Shear';
    this.render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
    this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

    this.shearX=this.addInPort(new Port(this,"shearX"));
    this.shearY=this.addInPort(new Port(this,"shearY"));

    var shearMatrix = mat4.create();

    function update()
    {
        mat4.identity(shearMatrix);
        shearMatrix[1]=Math.tan(self.shearX.get());
        shearMatrix[4]=Math.tan(self.shearY.get());
    }

    this.shearY.onValueChanged=update;
    this.shearX.onValueChanged=update;

    // 1, shearY, 0, 0, 
    //   shearX, 1, 0, 0,
    //   0, 0, 1, 0,
    //   0, 0, 0, 1 };

    this.render.onTriggered=function()
    {
        cgl.pushMvMatrix();

        mat4.multiply(cgl.mvMatrix,cgl.mvMatrix,shearMatrix);
        self.trigger.trigger();

        cgl.popMvMatrix();
    };

    self.shearX.set(0.0);
    self.shearY.set(0.0);
