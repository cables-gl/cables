    Op.apply(this, arguments);
    var self=this;
    var cgl=this.patch.cgl;

    this.name='DepthTexture';

    this.render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
    this.farPlane=this.addInPort(new Port(this,"farplane",OP_PORT_TYPE_VALUE));
    this.nearPlane=this.addInPort(new Port(this,"nearplane",OP_PORT_TYPE_VALUE));
    
    this.image=this.addInPort(new Port(this,"image",OP_PORT_TYPE_TEXTURE));
    this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

    var shader=new CGL.Shader(cgl);
    this.onLoaded=shader.compile;

    var srcFrag=''
        .endl()+'precision highp float;'
        .endl()+'#ifdef HAS_TEXTURES'
        .endl()+'  varying vec2 texCoord;'
        .endl()+'  uniform sampler2D image;'
        .endl()+'#endif'
        .endl()+'uniform float n;'
        .endl()+'uniform float f;'
        .endl()+''
        .endl()+'void main()'
        .endl()+'{'
        .endl()+'   vec4 col=vec4(0.0,0.0,0.0,1.0);'
        .endl()+'   #ifdef HAS_TEXTURES'
        .endl()+'       col=texture2D(image,texCoord);'
        .endl()+'       float z=col.r;'
        .endl()+'       float c=(2.0*n)/(f+n-z*(f-n));'

        .endl()+'       col=vec4(z,z,z,1.0);'

        // .endl()+'       if(c>=0.999)col.a=0.0;'
        // .endl()+'           else col.a=1.0;'
        .endl()+'   #endif'

        .endl()+'   gl_FragColor = col;'
        .endl()+'}';

    shader.setSource(shader.getDefaultVertexShader(),srcFrag);
    var textureUniform=new CGL.Uniform(shader,'t','image',0);

    var uniFarplane=new CGL.Uniform(shader,'f','f',1.0);
    var uniNearplane=new CGL.Uniform(shader,'f','n',1.0);

    this.farPlane.onValueChanged=function()
    {
        uniFarplane.setValue(self.farPlane.get());
    };
    self.farPlane.val=100.0;

    this.nearPlane.onValueChanged=function()
    {
        uniNearplane.setValue(self.nearPlane.get());
    };
    self.nearPlane.val=0.1;

    this.render.onTriggered=function()
    {
        if(!cgl.currentTextureEffect)return;

        if(self.image.val && self.image.val.tex)
        {
            cgl.setShader(shader);
            cgl.currentTextureEffect.bind();

            cgl.gl.activeTexture(cgl.gl.TEXTURE0);
            cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, self.image.val.tex );

            cgl.currentTextureEffect.finish();
            cgl.setPreviousShader();
        }

        self.trigger.trigger();
    };