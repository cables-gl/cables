    Op.apply(this, arguments);
    var cgl=this.patch.cgl;

    this.name='Orthogonal';
    var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
    var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

    var boundsLeft=this.addInPort(new Port(this,"left",OP_PORT_TYPE_VALUE ));
    boundsLeft.val=-1;

    var boundsRight=this.addInPort(new Port(this,"right",OP_PORT_TYPE_VALUE ));
    boundsRight.val=1;

    var boundsBottom=this.addInPort(new Port(this,"bottom",OP_PORT_TYPE_VALUE ));
    boundsBottom.val=-1;

    var boundsTop=this.addInPort(new Port(this,"top",OP_PORT_TYPE_VALUE ));
    boundsTop.val=1;

    var zNear=this.addInPort(new Port(this,"frustum near",OP_PORT_TYPE_VALUE ));
    zNear.val=0.01;

    var zFar=this.addInPort(new Port(this,"frustum far",OP_PORT_TYPE_VALUE ));
    zFar.val=2000.0;

    render.onTriggered=function()
    {
        var ratio=1;

        cgl.pushPMatrix();
        mat4.ortho(cgl.pMatrix, 
            boundsLeft.get()*ratio, 
            boundsRight.get()*ratio,  
            boundsBottom.get()*ratio, 
            boundsTop.get()*ratio, 
            parseFloat(zNear.get()), 
            parseFloat(zFar.get())
            );

        trigger.trigger();
        cgl.popPMatrix();
    };
