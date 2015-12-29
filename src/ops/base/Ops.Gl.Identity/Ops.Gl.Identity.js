    Op.apply(this, arguments);
    var self=this;
    var cgl=self.patch.cgl;

    this.name='Identity';
    this.exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));

    this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

    this.exe.onTriggered=function()
    {
        cgl.pushMvMatrix();

        mat4.identity(cgl.mvMatrix);
        self.trigger.trigger();

        cgl.popMvMatrix();
    };