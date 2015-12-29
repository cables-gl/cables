    Op.apply(this, arguments);
    var cgl=this.patch.cgl;

    this.name='ShaderSwitchBoolean';
    var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
    var value=this.addInPort(new Port(this,"value",OP_PORT_TYPE_VALUE));
    var shader=this.addInPort(new Port(this,"shader true",OP_PORT_TYPE_OBJECT));
    var shader2=this.addInPort(new Port(this,"shader false",OP_PORT_TYPE_OBJECT));
    var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));
    var shaderOut=this.addOutPort(new Port(this,"shaderOut",OP_PORT_TYPE_OBJECT));

    var doRender=function()
    {
        if(value.get())
        {
            if(shader.get())
            {
                cgl.setShader(shader.get());
                shaderOut.set(shader.get());
                shader.get().bindTextures();
                trigger.trigger();
                cgl.setPreviousShader();
            }
            
        }
        else
        {
            if(shader2.get())
            {
                cgl.setShader(shader2.get());
                shaderOut.set(shader2.get());
                shader2.get().bindTextures();
                trigger.trigger();
                cgl.setPreviousShader();
            }
            
        }
        
        
        
    };

    render.onTriggered=doRender;
    doRender();
