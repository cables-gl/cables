    Op.apply(this, arguments);
    var self=this;
    var cgl=self.patch.cgl;

    this.name='Perspective';
    this.render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
    this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

    this.fovY=this.addInPort(new Port(this,"fov y",OP_PORT_TYPE_VALUE ));
    this.fovY.val=45;

    this.zNear=this.addInPort(new Port(this,"frustum near",OP_PORT_TYPE_VALUE ));
    this.zNear.val=0.1;

    this.zFar=this.addInPort(new Port(this,"frustum far",OP_PORT_TYPE_VALUE ));
    this.zFar.val=2000.0;

    this.render.onTriggered=function()
    {
        mat4.perspective(cgl.pMatrix,cgl.frameStore.perspective.fovy*0.0174533, cgl.getViewPort()[2]/cgl.getViewPort()[3], cgl.frameStore.perspective.zNear, cgl.frameStore.perspective.zFar);
        cgl.pushPMatrix();

        self.trigger.trigger();

        cgl.popPMatrix();
    };

    function changed()
    {
        cgl.frameStore.perspective=
        {
            fovy:parseFloat(self.fovY.val),
            zFar:parseFloat(self.zFar.val),
            zNear:parseFloat(self.zNear.val),
        };
    }

    this.fovY.onValueChanged=changed;
    this.zFar.onValueChanged=changed;
    this.zNear.onValueChanged=changed;
    changed();
