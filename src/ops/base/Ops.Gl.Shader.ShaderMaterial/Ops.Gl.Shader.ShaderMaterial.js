    Op.apply(this, arguments);
    var self=this;
    var cgl=self.patch.cgl;

    this.name='ShaderMaterial';
    this.render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
    
    this.fragmentShader=this.addInPort(new Port(this,"fragment",OP_PORT_TYPE_VALUE,{display:'editor',editorSyntax:'glsl'}));
    this.vertexShader=this.addInPort(new Port(this,"vertex",OP_PORT_TYPE_VALUE,{display:'editor',editorSyntax:'glsl'}));

    this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

    this.doRender=function()
    {
        cgl.setShader(shader);
        self.trigger.trigger();
        cgl.setPreviousShader();
    };

    function updateShader()
    {
        shader.setSource(self.vertexShader.get(),self.fragmentShader.get());
        shader.compile();
    }


    var shader=new CGL.Shader(cgl);
    this.fragmentShader.set(shader.getDefaultFragmentShader());
    this.vertexShader.set(shader.getDefaultVertexShader());
    updateShader();
    this.onLoaded=shader.compile;

    this.fragmentShader.onValueChanged=updateShader;
    this.fragmentShader.onValueChanged=updateShader;


    this.render.onTriggered=this.doRender;
    this.doRender();
