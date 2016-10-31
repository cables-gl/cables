var CGL=CGL || {};

CGL.TextureEffectMesh=null;

CGL.TextureEffect=function(cgl,options)
{
    var self=this;

    if(!CGL.TextureEffectMesh)
    {
        var geom=new CGL.Geometry();

        geom.vertices = [
             1.0,  1.0,  0.0,
            -1.0,  1.0,  0.0,
             1.0, -1.0,  0.0,
            -1.0, -1.0,  0.0
        ];

        geom.texCoords = [
             1.0, 1.0,
             0.0, 1.0,
             1.0, 0.0,
             0.0, 0.0
        ];

        geom.verticesIndices = [
            0, 1, 2,
            3, 1, 2
        ];

        CGL.TextureEffectMesh=new CGL.Mesh(cgl,geom);
    }

    var textureSource = null;

    var opts=options ||
        {
            isFloatingPointTexture:false,
            filter:CGL.Texture.FILTER_LINEAR
        };
    if(options && options.fp)opts.isFloatingPointTexture=true;
    var textureTarget = new CGL.Texture(cgl,opts);
    var frameBuf      = cgl.gl.createFramebuffer();
    var renderbuffer  = cgl.gl.createRenderbuffer();

    var switched=false;

    this.delete=function()
    {
        if(textureTarget)textureTarget.delete();
        if(textureSource)textureSource.delete();
        cgl.gl.deleteRenderbuffer(renderbuffer);
        cgl.gl.deleteFramebuffer(frameBuf);
    };


    this.setSourceTexture=function(tex)
    {
        // if(textureSource==tex)return;

        if(tex===null)
        {
            textureSource=new CGL.Texture(cgl,opts);
            textureSource.setSize(16,16);
        }
        else
        {
            textureSource=tex;
        }

        if(!textureSource.compare(textureTarget))
        {
            console.log('change effect target texture');
            // textureTarget.textureType=textureSource.textureType;
            if(textureTarget)textureTarget.delete();

            textureTarget=textureSource.clone();

            if(!textureSource.compare(textureTarget))
            {
                console.log('still not comparing!!!!!!!!!!!');
            }




            // textureTarget.filter=textureSource.filter;
            // textureTarget.setSize(textureSource.width,textureSource.height);
            // textureTarget.name="effect target";

            textureSource.printInfo();
            textureTarget.printInfo();


            CGL.profileEffectBuffercreate++;
            cgl.gl.bindFramebuffer(cgl.gl.FRAMEBUFFER, frameBuf);

            cgl.gl.bindRenderbuffer(cgl.gl.RENDERBUFFER, renderbuffer);
            cgl.gl.renderbufferStorage(cgl.gl.RENDERBUFFER, cgl.gl.DEPTH_COMPONENT16, textureSource.width,textureSource.height);
            cgl.gl.framebufferTexture2D(cgl.gl.FRAMEBUFFER, cgl.gl.COLOR_ATTACHMENT0, cgl.gl.TEXTURE_2D, textureTarget.tex, 0);
            cgl.gl.framebufferRenderbuffer(cgl.gl.FRAMEBUFFER, cgl.gl.DEPTH_ATTACHMENT, cgl.gl.RENDERBUFFER, renderbuffer);
            cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, null);
            cgl.gl.bindRenderbuffer(cgl.gl.RENDERBUFFER, null);
            cgl.gl.bindFramebuffer(cgl.gl.FRAMEBUFFER, null);

        }

    };

    this.getCurrentTargetTexture=function()
    {
        if(switched)return textureSource;
            else return textureTarget;
    };

    this.getCurrentSourceTexture=function()
    {
        if(switched)return textureTarget;
            else return textureSource;
    };

    this.startEffect=function()
    {
        switched=false;
        cgl.gl.disable(cgl.gl.DEPTH_TEST);

        // cgl.gl.clearColor(0,0,0,0);
        // cgl.gl.clear(cgl.gl.COLOR_BUFFER_BIT | cgl.gl.DEPTH_BUFFER_BIT);

        cgl.pushMvMatrix();

        cgl.pushPMatrix();
        cgl.gl.viewport(0, 0, self.getCurrentTargetTexture().width,self.getCurrentTargetTexture().height);
        mat4.perspective(cgl.pMatrix,45, self.getCurrentTargetTexture().width/self.getCurrentTargetTexture().height, 0.1, 1100.0);

        cgl.pushPMatrix();
        mat4.identity(cgl.pMatrix);

        cgl.pushViewMatrix();
        mat4.identity(cgl.vMatrix);

        cgl.pushMvMatrix();
        mat4.identity(cgl.mvMatrix);

    };
    this.endEffect=function()
    {
        cgl.gl.enable(cgl.gl.DEPTH_TEST);
        cgl.popMvMatrix();

        cgl.popPMatrix();
        cgl.popMvMatrix();
        cgl.popViewMatrix();

        cgl.popPMatrix();
        cgl.resetViewPort();
    };

    this.bind=function()
    {
        if(textureSource===null)
        {
            console.log('no base texture set!');
            return;
        }

        cgl.gl.bindFramebuffer(cgl.gl.FRAMEBUFFER, frameBuf);
        cgl.pushFrameBuffer(frameBuf);

        cgl.gl.framebufferTexture2D(cgl.gl.FRAMEBUFFER, cgl.gl.COLOR_ATTACHMENT0, cgl.gl.TEXTURE_2D, self.getCurrentTargetTexture().tex, 0);
    };

    this.finish=function()
    {
        if(textureSource===null)
        {
            console.log('no base texture set!');
            return;
        }

        CGL.TextureEffectMesh.render(cgl.getShader());

        cgl.gl.bindFramebuffer(cgl.gl.FRAMEBUFFER, cgl.popFrameBuffer());

        switched=!switched;
    };

};



CGL.TextureEffect.getBlendCode=function()
{
    return ''
    .endl()+'#define Blend(base, blend, funcf)       vec3(funcf(base.r, blend.r), funcf(base.g, blend.g), funcf(base.b, blend.b))'

    .endl()+'vec3 _blend(vec3 base,vec3 blend)'
    .endl()+'{'
    .endl()+'   vec3 colNew=blend;'
    // .endl()+'   #ifdef BM_NORMAL'
    // .endl()+'   colNew=blend;'
    // .endl()+'   #endif'

    .endl()+'   #ifdef BM_MULTIPLY'
    .endl()+'   colNew=base*blend;'
    .endl()+'   #endif'

    .endl()+'   #ifdef BM_MULTIPLY_INV'
    .endl()+'   colNew=base* vec3(1.0)-blend;'
    .endl()+'   #endif'


    .endl()+'   #ifdef BM_AVERAGE'
    .endl()+'   colNew=((base + blend) / 2.0);'
    .endl()+'   #endif'

    .endl()+'   #ifdef BM_ADD'
    .endl()+'   colNew=min(base + blend, vec3(1.0));'
    .endl()+'   #endif'

    .endl()+'   #ifdef BM_SUBSTRACT'
    .endl()+'   colNew=max(base + blend - vec3(1.0), vec3(0.0));'
    .endl()+'   #endif'

    .endl()+'   #ifdef BM_DIFFERENCE'
    .endl()+'   colNew=abs(base - blend);'
    .endl()+'   #endif'

    .endl()+'   #ifdef BM_NEGATION'
    .endl()+'   colNew=(vec3(1.0) - abs(vec3(1.0) - base - blend));'
    .endl()+'   #endif'

    .endl()+'   #ifdef BM_EXCLUSION'
    .endl()+'   colNew=(base + blend - 2.0 * base * blend);'
    .endl()+'   #endif'

    .endl()+'   #ifdef BM_LIGHTEN'
    .endl()+'   colNew=max(blend, base);'
    .endl()+'   #endif'

    .endl()+'   #ifdef BM_DARKEN'
    .endl()+'   colNew=min(blend, base);'
    .endl()+'   #endif'

    .endl()+'   #ifdef BM_OVERLAY'
    .endl()+'      #define BlendOverlayf(base, blend)  (base < 0.5 ? (2.0 * base * blend) : (1.0 - 2.0 * (1.0 - base) * (1.0 - blend)))'
    // .endl()+'       #define BlendOverlay(base, blend)       Blend(base, blend, BlendOverlayf)'
    .endl()+'      colNew=Blend(base, blend, BlendOverlayf);'
    .endl()+'   #endif'

    .endl()+'   #ifdef BM_SCREEN'
    .endl()+'      #define BlendScreenf(base, blend)       (1.0 - ((1.0 - base) * (1.0 - blend)))'
    // .endl()+'       #define BlendScreen(base, blend)        Blend(base, blend, BlendScreenf)'
    .endl()+'      colNew=Blend(base, blend, BlendScreenf);'
    .endl()+'   #endif'

    .endl()+'   #ifdef BM_SOFTLIGHT'
    .endl()+'      #define BlendSoftLightf(base, blend)    ((blend < 0.5) ? (2.0 * base * blend + base * base * (1.0 - 2.0 * blend)) : (sqrt(base) * (2.0 * blend - 1.0) + 2.0 * base * (1.0 - blend)))'
    // .endl()+'       #define BlendSoftLight(base, blend)     Blend(base, blend, BlendSoftLightf)'
    .endl()+'      colNew=Blend(base, blend, BlendSoftLightf);'
    .endl()+'   #endif'

    .endl()+'   #ifdef BM_HARDLIGHT'
    .endl()+'      #define BlendOverlayf(base, blend)  (base < 0.5 ? (2.0 * base * blend) : (1.0 - 2.0 * (1.0 - base) * (1.0 - blend)))'
    // .endl()+'       #define BlendOverlay(base, blend)       Blend(base, blend, BlendOverlayf)'
    .endl()+'      colNew=Blend(blend, base, BlendOverlayf);'
    .endl()+'   #endif'

    .endl()+'   #ifdef BM_COLORDODGE'
    .endl()+'      #define BlendColorDodgef(base, blend)   ((blend == 1.0) ? blend : min(base / (1.0 - blend), 1.0))'
    .endl()+'      colNew=Blend(base, blend, BlendColorDodgef);'
    .endl()+'   #endif'

    .endl()+'   #ifdef BM_COLORBURN'
    .endl()+'      #define BlendColorBurnf(base, blend)    ((blend == 0.0) ? blend : max((1.0 - ((1.0 - base) / blend)), 0.0))'
    .endl()+'      colNew=Blend(base, blend, BlendColorBurnf);'
    .endl()+'   #endif'

    .endl()+'   return colNew;'

    .endl()+'}';
};


CGL.TextureEffect.onChangeBlendSelect=function(shader,blendName)
{
    if(blendName=='normal') shader.define('BM_NORMAL');
        else shader.removeDefine('BM_NORMAL');

    if(blendName=='multiply') shader.define('BM_MULTIPLY');
        else shader.removeDefine('BM_MULTIPLY');

    if(blendName=='multiply invert') shader.define('BM_MULTIPLY_INV');
        else shader.removeDefine('BM_MULTIPLY_INV');

    if(blendName=='average') shader.define('BM_AVERAGE');
        else shader.removeDefine('BM_AVERAGE');

    if(blendName=='add') shader.define('BM_ADD');
        else shader.removeDefine('BM_ADD');

    if(blendName=='substract') shader.define('BM_SUBSTRACT');
        else shader.removeDefine('BM_SUBSTRACT');

    if(blendName=='difference') shader.define('BM_DIFFERENCE');
        else shader.removeDefine('BM_DIFFERENCE');

    if(blendName=='negation') shader.define('BM_NEGATION');
        else shader.removeDefine('BM_NEGATION');

    if(blendName=='exclusion') shader.define('BM_EXCLUSION');
        else shader.removeDefine('BM_EXCLUSION');

    if(blendName=='lighten') shader.define('BM_LIGHTEN');
        else shader.removeDefine('BM_LIGHTEN');

    if(blendName=='darken') shader.define('BM_DARKEN');
        else shader.removeDefine('BM_DARKEN');

    if(blendName=='overlay') shader.define('BM_OVERLAY');
        else shader.removeDefine('BM_OVERLAY');

    if(blendName=='screen') shader.define('BM_SCREEN');
        else shader.removeDefine('BM_SCREEN');

    if(blendName=='softlight') shader.define('BM_SOFTLIGHT');
        else shader.removeDefine('BM_SOFTLIGHT');

    if(blendName=='hardlight') shader.define('BM_HARDLIGHT');
        else shader.removeDefine('BM_HARDLIGHT');

    if(blendName=='color dodge') shader.define('BM_COLORDODGE');
        else shader.removeDefine('BM_COLORDODGE');

    if(blendName=='color burn') shader.define('BM_COLORBURN');
        else shader.removeDefine('BM_COLORBURN');

};

CGL.TextureEffect.AddBlendSelect=function(op,name)
{
    var p=op.inValueSelect(name,
        [
            'normal',
            'lighten',
            'darken',
            'multiply',
            'multiply invert',
            'average',
            'add',
            'substract',
            'difference',
            'negation',
            'exclusion',
            'overlay',
            'screen',
            'color dodge',
            'color burn',
            'softlight',
            'hardlight'
        ]);

    return p;
};
