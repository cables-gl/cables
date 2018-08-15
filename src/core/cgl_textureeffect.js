var CGL=CGL || {};

CGL.TextureEffect=function(cgl,options)
{
    this._cgl=cgl;

    if(!cgl.TextureEffectMesh)this.createMesh();

    this._textureSource = null;

    //TODO: do we still need the options ?
    // var opts=options ||
    //     {
    //         isFloatingPointTexture:false,
    //         filter:CGL.Texture.FILTER_LINEAR
    //     };
    // if(options && options.fp)opts.isFloatingPointTexture=true;

    this._textureTarget = null;//new CGL.Texture(this._cgl,opts);
    this._frameBuf      = this._cgl.gl.createFramebuffer();
    this._frameBuf2      = this._cgl.gl.createFramebuffer();
    this._renderbuffer  = this._cgl.gl.createRenderbuffer();
    this._renderbuffer2  = this._cgl.gl.createRenderbuffer();
    this.switched=false;
    this.depth=false;
};


CGL.TextureEffect.prototype.setSourceTexture=function(tex)
{
    if(tex===null)
    {
        this._textureSource=new CGL.Texture(this._cgl);
        this._textureSource.setSize(16,16);
    }
    else
    {
        this._textureSource=tex;
    }

    if(!this._textureSource.compareSettings(this._textureTarget))
    {
        // console.log('change effect target texture ');
        // if(this._textureTarget) console.log('change effect target texture from to ',this._textureTarget.width,this._textureSource.width);
        // this._textureTarget.textureType=this._textureSource.textureType;
        if(this._textureTarget)this._textureTarget.delete();

        this._textureTarget=this._textureSource.clone();

        CGL.profileEffectBuffercreate++;
        this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, this._frameBuf);

        this._cgl.gl.bindRenderbuffer(this._cgl.gl.RENDERBUFFER, this._renderbuffer);
        if(this.depth) this._cgl.gl.renderbufferStorage(this._cgl.gl.RENDERBUFFER, this._cgl.gl.DEPTH_COMPONENT16, this._textureSource.width,this._textureSource.height);
        this._cgl.gl.framebufferTexture2D(this._cgl.gl.FRAMEBUFFER, this._cgl.gl.COLOR_ATTACHMENT0, this._cgl.gl.TEXTURE_2D, this._textureTarget.tex, 0);
        if(this.depth) this._cgl.gl.framebufferRenderbuffer(this._cgl.gl.FRAMEBUFFER, this._cgl.gl.DEPTH_ATTACHMENT, this._cgl.gl.RENDERBUFFER, this._renderbuffer);

        // this._cgl.gl.framebufferTexture2D(this._cgl.gl.FRAMEBUFFER, this._cgl.gl.COLOR_ATTACHMENT0, this._cgl.gl.TEXTURE_2D, this._textureTarget.tex, 0);

        this._cgl.gl.bindTexture(this._cgl.gl.TEXTURE_2D, null);
        this._cgl.gl.bindRenderbuffer(this._cgl.gl.RENDERBUFFER, null);
        this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, null);





        this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, this._frameBuf2);

        this._cgl.gl.bindRenderbuffer(this._cgl.gl.RENDERBUFFER, this._renderbuffer2);
        if(this.depth) this._cgl.gl.renderbufferStorage(this._cgl.gl.RENDERBUFFER, this._cgl.gl.DEPTH_COMPONENT16, this._textureSource.width,this._textureSource.height);
        this._cgl.gl.framebufferTexture2D(this._cgl.gl.FRAMEBUFFER, this._cgl.gl.COLOR_ATTACHMENT0, this._cgl.gl.TEXTURE_2D, this._textureSource.tex, 0);
        if(this.depth) this._cgl.gl.framebufferRenderbuffer(this._cgl.gl.FRAMEBUFFER, this._cgl.gl.DEPTH_ATTACHMENT, this._cgl.gl.RENDERBUFFER, this._renderbuffer2);

        // this._cgl.gl.framebufferTexture2D(this._cgl.gl.FRAMEBUFFER, this._cgl.gl.COLOR_ATTACHMENT0, this._cgl.gl.TEXTURE_2D, this._textureSource.tex, 0);

        this._cgl.gl.bindTexture(this._cgl.gl.TEXTURE_2D, null);
        this._cgl.gl.bindRenderbuffer(this._cgl.gl.RENDERBUFFER, null);
        this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, null);


    }
};

CGL.TextureEffect.prototype.startEffect=function()
{
    if(!this._textureTarget)
    {
        console.log('effect has no target');
        return;
    }

    this.switched=false;
    // this._cgl.gl.disable(this._cgl.gl.DEPTH_TEST);
    this._cgl.pushDepthTest(false);


    this._cgl.pushModelMatrix();

    this._cgl.pushPMatrix();
    this._cgl.gl.viewport(0, 0, this.getCurrentTargetTexture().width,this.getCurrentTargetTexture().height);
    mat4.perspective(this._cgl.pMatrix,45, this.getCurrentTargetTexture().width/this.getCurrentTargetTexture().height, 0.1, 1100.0);

    this._cgl.pushPMatrix();
    mat4.identity(this._cgl.pMatrix);

    this._cgl.pushViewMatrix();
    mat4.identity(this._cgl.vMatrix);

    this._cgl.pushModelMatrix();
    mat4.identity(this._cgl.mvMatrix);
};

CGL.TextureEffect.prototype.endEffect=function()
{
    this._cgl.popDepthTest(false);
    // this._cgl.gl.enable(this._cgl.gl.DEPTH_TEST);
    this._cgl.popModelMatrix();

    this._cgl.popPMatrix();
    this._cgl.popModelMatrix();
    this._cgl.popViewMatrix();

    this._cgl.popPMatrix();
    this._cgl.resetViewPort();
};

CGL.TextureEffect.prototype.bind=function()
{
    if(this._textureSource===null)
    {
        console.log('no base texture set!');
        return;
    }

    if(!this.switched)
    {
        this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, this._frameBuf);
        this._cgl.pushGlFrameBuffer(this._frameBuf);
    }
    else
	{
        this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, this._frameBuf2);
        this._cgl.pushGlFrameBuffer(this._frameBuf2);
    }
};

CGL.TextureEffect.prototype.finish=function()
{
    if(this._textureSource===null)
    {
        console.log('no base texture set!');
        return;
    }

    this._cgl.TextureEffectMesh.render(this._cgl.getShader());

    this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, this._cgl.popGlFrameBuffer());

    // this._textureTarget.updateMipMap();

    if(this._textureTarget.filter==CGL.Texture.FILTER_MIPMAP)
    {
        if(!this.switched)
        {
            this._cgl.gl.bindTexture(this._cgl.gl.TEXTURE_2D, this._textureTarget.tex);
            this._textureTarget.updateMipMap();
        }
        else
        {
            this._cgl.gl.bindTexture(this._cgl.gl.TEXTURE_2D, this._textureSource.tex);;
            this._textureSource.updateMipMap();
        }
        
        this._cgl.gl.bindTexture(this._cgl.gl.TEXTURE_2D, null);
    }


    this.switched=!this.switched;
};

CGL.TextureEffect.prototype.getCurrentTargetTexture=function()
{
    if(this.switched)return this._textureSource;
        else return this._textureTarget;
};

CGL.TextureEffect.prototype.getCurrentSourceTexture=function()
{
    if(this.switched)return this._textureTarget;
        else return this._textureSource;
};

CGL.TextureEffect.prototype.delete=function()
{
    if(this._textureTarget)this._textureTarget.delete();
    if(this._textureSource)this._textureSource.delete();
    this._cgl.gl.deleteRenderbuffer(this._renderbuffer);
    this._cgl.gl.deleteFramebuffer(this._frameBuf);
};

CGL.TextureEffect.prototype.createMesh=function()
{
    this._cgl.TextureEffectMesh=CGL.MESHES.getSimpleRect(this._cgl,"textureEffect rect");
};


// ---------------------------------------------------------------------------------

CGL.TextureEffect.checkOpInEffect=function(op)
{
    if(!op.patch.cgl.currentTextureEffect && !op.uiAttribs.error)
    {
        op.uiAttr({'error':'This op must be a child of a texture effect! More infos <a href="https://docs.cables.gl/image_composition/image_composition.html" target="_blank">here</a>.'});
        return false;
    }
    if(op.patch.cgl.currentTextureEffect && op.uiAttribs.error)
    {
        op.uiAttr({'error':null});
        return true;
    }
    if(op.patch.cgl.currentTextureEffect)return true;

    if(!op.patch.cgl.currentTextureEffect)return false;
    return true;
};

CGL.TextureEffect.getBlendCode=function()
{
    return ''
    //.endl()+'#define Blend(base, blend, funcf)       vec3(funcf(base.r, blend.r), funcf(base.g, blend.g), funcf(base.b, blend.b))'

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
//    .endl()+'      colNew=Blend(base, blend, BlendOverlayf);'
    .endl()+'      colNew=vec3(BlendOverlayf(base.r, blend.r),BlendOverlayf(base.g, blend.g),BlendOverlayf(base.b, blend.b));'
    .endl()+'   #endif'

    .endl()+'   #ifdef BM_SCREEN'
    .endl()+'      #define BlendScreenf(base, blend)       (1.0 - ((1.0 - base) * (1.0 - blend)))'
    // .endl()+'       #define BlendScreen(base, blend)        Blend(base, blend, BlendScreenf)'
    //.endl()+'      colNew=Blend(base, blend, BlendScreenf);'
    .endl()+'      colNew=vec3(BlendScreenf(base.r, blend.r),BlendScreenf(base.g, blend.g),BlendScreenf(base.b, blend.b));'
    .endl()+'   #endif'

    .endl()+'   #ifdef BM_SOFTLIGHT'
    .endl()+'      #define BlendSoftLightf(base, blend)    ((blend < 0.5) ? (2.0 * base * blend + base * base * (1.0 - 2.0 * blend)) : (sqrt(base) * (2.0 * blend - 1.0) + 2.0 * base * (1.0 - blend)))'
    // .endl()+'       #define BlendSoftLight(base, blend)     Blend(base, blend, BlendSoftLightf)'
//    .endl()+'      colNew=Blend(base, blend, BlendSoftLightf);'
    .endl()+'      colNew=vec3(BlendSoftLightf(base.r, blend.r),BlendSoftLightf(base.g, blend.g),BlendSoftLightf(base.b, blend.b));'

    .endl()+'   #endif'

    .endl()+'   #ifdef BM_HARDLIGHT'
    .endl()+'      #define BlendOverlayf(base, blend)  (base < 0.5 ? (2.0 * base * blend) : (1.0 - 2.0 * (1.0 - base) * (1.0 - blend)))'
    // .endl()+'       #define BlendOverlay(base, blend)       Blend(base, blend, BlendOverlayf)'
    //.endl()+'      colNew=Blend(blend, base, BlendOverlayf);'
    .endl()+'      colNew=vec3(BlendOverlayf(base.r, blend.r),BlendOverlayf(base.g, blend.g),BlendOverlayf(base.b, blend.b));'

    .endl()+'   #endif'

    .endl()+'   #ifdef BM_COLORDODGE'
    .endl()+'      #define BlendColorDodgef(base, blend)   ((blend == 1.0) ? blend : min(base / (1.0 - blend), 1.0))'
   // .endl()+'      colNew=Blend(base, blend, BlendColorDodgef);'
    .endl()+'      colNew=vec3(BlendColorDodgef(base.r, blend.r),BlendColorDodgef(base.g, blend.g),BlendColorDodgef(base.b, blend.b));'

    .endl()+'   #endif'

    .endl()+'   #ifdef BM_COLORBURN'
    .endl()+'      #define BlendColorBurnf(base, blend)    ((blend == 0.0) ? blend : max((1.0 - ((1.0 - base) / blend)), 0.0))'
    //.endl()+'      colNew=Blend(base, blend, BlendColorBurnf);'
    .endl()+'      colNew=vec3(BlendColorBurnf(base.r, blend.r),BlendColorBurnf(base.g, blend.g),BlendColorBurnf(base.b, blend.b));'

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
        ],"normal");

    return p;
};
