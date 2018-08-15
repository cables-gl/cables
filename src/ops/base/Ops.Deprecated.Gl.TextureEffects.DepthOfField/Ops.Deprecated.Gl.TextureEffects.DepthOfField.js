    Op.apply(this, arguments);
    var self=this;
    var cgl=this.patch.cgl;

    this.name='DepthOfField';
    this.render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
    this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));
    this.depthTex=this.addInPort(new Port(this,"depth map",OP_PORT_TYPE_TEXTURE));

    this.farPlane=this.addInPort(new Port(this,"farplane",OP_PORT_TYPE_VALUE));
    this.nearPlane=this.addInPort(new Port(this,"nearplane",OP_PORT_TYPE_VALUE));

    this.showIntensity=this.addInPort(new Port(this,"showIntensity",OP_PORT_TYPE_VALUE,{display:'bool'}));

    this.iterations=this.addInPort(new Port(this,"iterations",OP_PORT_TYPE_VALUE));
    this.iterations.val=10;

    var shader=new CGL.Shader(cgl);
    // this.onLoaded=shader.compile;

    var srcFrag=''
        .endl()+'precision mediump float;'
        .endl()+'#ifdef HAS_TEXTURES'
        .endl()+'  IN vec2 texCoord;'
        .endl()+'  UNI sampler2D tex;'
        .endl()+'  UNI sampler2D depthTex;'
        .endl()+'  UNI float dirX;'
        // .endl()+'  UNI float dirY;'
        .endl()+'  UNI float width;'
        .endl()+'  UNI float height;'

        .endl()+'  UNI float f;'
        .endl()+'  UNI float n;'

        .endl()+'#endif'
        .endl()+''
        .endl()+'vec4 blur9(sampler2D text, vec2 uv, vec2 red, vec2 dir)'
        .endl()+'{'
        .endl()+'   vec4 color = vec4(0.0);'
        .endl()+'   vec2 offset1 = vec2(1.3846153846) * dir*1.5;'
        .endl()+'   vec2 offset2 = vec2(3.2307692308) * dir*1.5;'
        .endl()+'   color += texture2D(text, uv) * 0.2270270270;'
        .endl()+'   color += texture2D(text, uv + (offset1 / red)) * 0.3162162162;'
        .endl()+'   color += texture2D(text, uv - (offset1 / red)) * 0.3162162162;'
        .endl()+'   color += texture2D(text, uv + (offset2 / red)) * 0.0702702703;'
        .endl()+'   color += texture2D(text, uv - (offset2 / red)) * 0.0702702703;'
        .endl()+'   return color;'
        .endl()+'}'
        .endl()+''

        .endl()+'float getDepth(vec2 tc)'
        .endl()+'{'
        .endl()+'       float z=texture2D(depthTex,tc).r;'
        .endl()+'       float c=(2.0*n)/(f+n-z*(f-n));'
        .endl()+'       if(c>=0.99)c=0.0;'
        .endl()+'       return c;'
        .endl()+'}'


        .endl()+'void main()'
        .endl()+'{'
        .endl()+'   vec4 col=vec4(1.0,0.0,0.0,1.0);'
        .endl()+'   #ifdef HAS_TEXTURES'
        .endl()+'   float dirY=0.0;'
        .endl()+'   if(dirX==0.0)dirY=1.0;'


        .endl()+'   vec4 baseCol=texture2D(tex, texCoord);'


        .endl()+'   float d=getDepth(texCoord);'
        // .endl()+'   float ds=d+getDepth(texCoord*1.1)+getDepth(texCoord*0.9);'

        // .endl()+'       if(ds>0.0)'
        .endl()+'           col=blur9(tex,texCoord,vec2(width,height),vec2(dirX,dirY));'
        .endl()+'       col=mix(baseCol,col,d );'

        .endl()+'       #ifdef SHOW_INTENSITY'
        .endl()+'       col=vec4(d,d,d,1.0);'
        .endl()+'       #endif'

        .endl()+'   #endif'
        .endl()+'   outColor = col;'
        .endl()+'}';

    shader.setSource(shader.getDefaultVertexShader(),srcFrag);
    var textureUniform=new CGL.Uniform(shader,'t','tex',0);
    var depthTexUniform=new CGL.Uniform(shader,'t','depthTex',1);

    var uniDirX=new CGL.Uniform(shader,'f','dirX',0);
    var uniDirY=new CGL.Uniform(shader,'f','dirY',0);

    var uniWidth=new CGL.Uniform(shader,'f','width',0);
    var uniHeight=new CGL.Uniform(shader,'f','height',0);

    var uniFarplane=new CGL.Uniform(shader,'f','f',self.farPlane.get());
    var uniNearplane=new CGL.Uniform(shader,'f','n',self.nearPlane.get());

    this.showIntensity.onValueChanged=function()
    {
        if(self.showIntensity.get()) shader.define('SHOW_INTENSITY');
        else shader.removeDefine('SHOW_INTENSITY');
    };

    this.farPlane.onValueChanged=function()
    {
        uniFarplane.setValue(self.farPlane.val);
    };
    self.farPlane.val=5.0;

    this.nearPlane.onValueChanged=function()
    {
        uniNearplane.setValue(self.nearPlane.val);
    };
    self.nearPlane.val=0.01;

    this.render.onTriggered=function()
    {
        if(!cgl.currentTextureEffect)return;
        cgl.setShader(shader);

        uniWidth.setValue(cgl.currentTextureEffect.getCurrentSourceTexture().width);
        uniHeight.setValue(cgl.currentTextureEffect.getCurrentSourceTexture().height);

        for(var i =0;i<self.iterations.val;i++)
        {
            // first pass

            cgl.currentTextureEffect.bind();
            cgl.gl.activeTexture(cgl.gl.TEXTURE0);
            cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );
            if(i===0)
            {

            cgl.gl.activeTexture(cgl.gl.TEXTURE1);
            cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, self.depthTex.get().tex );

            }


            uniDirX.setValue(0.0);
            // uniDirY.setValue(1.0);

            cgl.currentTextureEffect.finish();

            // second pass

            cgl.currentTextureEffect.bind();
            cgl.gl.activeTexture(cgl.gl.TEXTURE0);
            cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

            // cgl.gl.activeTexture(cgl.gl.TEXTURE1);
            // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, self.depthTex.get().tex );

            uniDirX.setValue(1.0);
            // uniDirY.setValue(0.0);

            cgl.currentTextureEffect.finish();
        }

        cgl.setPreviousShader();
        self.trigger.trigger();
    };
