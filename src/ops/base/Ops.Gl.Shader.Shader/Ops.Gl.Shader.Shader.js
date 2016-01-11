    Op.apply(this, arguments);
    var self=this;
    var cgl=self.patch.cgl;

    this.name='Shader';
    this.render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
    this.shader=this.addInPort(new Port(this,"shader",OP_PORT_TYPE_OBJECT));
    this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));
    this.shader.ignoreValueSerialize=true;

    this.doRender=function()
    {
        if(self.shader.val)
        {
            cgl.setShader(self.shader.val);
            self.shader.val.bindTextures();
            self.trigger.trigger();
            cgl.setPreviousShader();
        }
    };

    this.render.onTriggered=this.doRender;
    this.doRender();
