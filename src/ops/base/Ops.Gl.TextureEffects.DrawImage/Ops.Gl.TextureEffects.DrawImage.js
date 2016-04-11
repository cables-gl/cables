CABLES.Op.apply(this, arguments);
var self=this;
var cgl=this.patch.cgl;

this.name='DrawImage';

this.render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
this.amount=this.addInPort(new Port(this,"amount",OP_PORT_TYPE_VALUE,{ display:'range' }));

this.image=this.addInPort(new Port(this,"image",OP_PORT_TYPE_TEXTURE,{preview:true }));
this.blendMode=this.addInPort(new Port(this,"blendMode",OP_PORT_TYPE_VALUE,{ display:'dropdown',values:[
    'normal','lighten','darken','multiply','average','add','substract','difference','negation','exclusion','overlay','screen',
    'color dodge',
    'color burn',
    'softlight',
    'hardlight'
    ] }));
self.blendMode.val='normal';
this.imageAlpha=this.addInPort(new Port(this,"imageAlpha",OP_PORT_TYPE_TEXTURE,{preview:true }));
this.alphaSrc=this.addInPort(new Port(this,"alphaSrc",OP_PORT_TYPE_VALUE,{ display:'dropdown',values:[
    'alpha channel','luminance'
    ] }));
this.removeAlphaSrc=this.addInPort(new Port(this,"removeAlphaSrc",OP_PORT_TYPE_VALUE,{ display:'bool' }));

this.invAlphaChannel=this.addInPort(new Port(this,"invert alpha channel",OP_PORT_TYPE_VALUE,{ display:'bool' }));


this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

var shader=new CGL.Shader(cgl);
this.onLoaded=shader.compile;

var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'#ifdef HAS_TEXTURES'
    .endl()+'  varying vec2 texCoord;'
    .endl()+'  uniform sampler2D tex;'
    .endl()+'  uniform sampler2D image;'
    .endl()+'#endif'

    // .endl()+'#ifdef TEX_TRANSFORM'
    .endl()+'   uniform float posX;'
    .endl()+'   uniform float posY;'
    .endl()+'   uniform float scale;'
    // .endl()+'#endif'

    .endl()+'#ifdef HAS_TEXTUREALPHA'
    .endl()+'   uniform sampler2D imageAlpha;'
    .endl()+'#endif'

    .endl()+'uniform float amount;'
    .endl()+''
    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec4 blendRGBA=vec4(0.0,0.0,0.0,1.0);'
    .endl()+'   #ifdef HAS_TEXTURES'
    .endl()+'       vec2 tc=texCoord;'
    .endl()+''
    .endl()+'       #ifdef TEX_FLIP_X'
    .endl()+'           tc.x=1.0-tc.x;'
    .endl()+'       #endif'
    .endl()+'       #ifdef TEX_FLIP_Y'
    .endl()+'           tc.y=1.0-tc.y;'
    .endl()+'       #endif'
    .endl()+''
    .endl()+'       #ifdef TEX_TRANSFORM'
    .endl()+'           tc.x /= scale;'
    .endl()+'           tc.y /= scale;'
    .endl()+'           tc.x += posX;'
    .endl()+'           tc.y += posY;'
    .endl()+'       #endif'
    .endl()+''
    .endl()+''
    .endl()+'       blendRGBA=texture2D(image,tc);'
    .endl()+''
    .endl()+'vec3 blend=blendRGBA.rgb;'
    .endl()+'vec4 baseRGBA=texture2D(tex,texCoord);'
    .endl()+'vec3 base=baseRGBA.rgb;'

    .endl()+'vec3 colNew=blend;'
    .endl()+'#define Blend(base, blend, funcf)       vec3(funcf(base.r, blend.r), funcf(base.g, blend.g), funcf(base.b, blend.b))'


    .endl()+'#ifdef BM_NORMAL'
    .endl()+'colNew=blend;'
    .endl()+'#endif'

    .endl()+'#ifdef BM_MULTIPLY'
    .endl()+'colNew=base*blend;'
    .endl()+'#endif'


    .endl()+'#ifdef BM_AVERAGE'
    .endl()+'colNew=((base + blend) / 2.0);'
    .endl()+'#endif'

    .endl()+'#ifdef BM_ADD'
    .endl()+'colNew=min(base + blend, vec3(1.0));'
    .endl()+'#endif'

    .endl()+'#ifdef BM_SUBSTRACT'
    .endl()+'colNew=max(base + blend - vec3(1.0), vec3(0.0));'
    .endl()+'#endif'

    .endl()+'#ifdef BM_DIFFERENCE'
    .endl()+'colNew=abs(base - blend);'
    .endl()+'#endif'

    .endl()+'#ifdef BM_NEGATION'
    .endl()+'colNew=(vec3(1.0) - abs(vec3(1.0) - base - blend));'
    .endl()+'#endif'

    .endl()+'#ifdef BM_EXCLUSION'
    .endl()+'colNew=(base + blend - 2.0 * base * blend);'
    .endl()+'#endif'

    .endl()+'#ifdef BM_LIGHTEN'
    .endl()+'colNew=max(blend, base);'
    .endl()+'#endif'

    .endl()+'#ifdef BM_DARKEN'
    .endl()+'colNew=min(blend, base);'
    .endl()+'#endif'

    .endl()+'#ifdef BM_OVERLAY'
    .endl()+'   #define BlendOverlayf(base, blend)  (base < 0.5 ? (2.0 * base * blend) : (1.0 - 2.0 * (1.0 - base) * (1.0 - blend)))'
    // .endl()+'   #define BlendOverlay(base, blend)       Blend(base, blend, BlendOverlayf)'
    .endl()+'   colNew=Blend(base, blend, BlendOverlayf);'
    .endl()+'#endif'

    .endl()+'#ifdef BM_SCREEN'
    .endl()+'   #define BlendScreenf(base, blend)       (1.0 - ((1.0 - base) * (1.0 - blend)))'
    // .endl()+'   #define BlendScreen(base, blend)        Blend(base, blend, BlendScreenf)'
    .endl()+'   colNew=Blend(base, blend, BlendScreenf);'
    .endl()+'#endif'

    .endl()+'#ifdef BM_SOFTLIGHT'
    .endl()+'   #define BlendSoftLightf(base, blend)    ((blend < 0.5) ? (2.0 * base * blend + base * base * (1.0 - 2.0 * blend)) : (sqrt(base) * (2.0 * blend - 1.0) + 2.0 * base * (1.0 - blend)))'
    // .endl()+'   #define BlendSoftLight(base, blend)     Blend(base, blend, BlendSoftLightf)'
    .endl()+'   colNew=Blend(base, blend, BlendSoftLightf);'
    .endl()+'#endif'

    .endl()+'#ifdef BM_HARDLIGHT'
    .endl()+'   #define BlendOverlayf(base, blend)  (base < 0.5 ? (2.0 * base * blend) : (1.0 - 2.0 * (1.0 - base) * (1.0 - blend)))'
    // .endl()+'   #define BlendOverlay(base, blend)       Blend(base, blend, BlendOverlayf)'
    .endl()+'   colNew=Blend(blend, base, BlendOverlayf);'
    .endl()+'#endif'

    .endl()+'#ifdef BM_COLORDODGE'
    .endl()+'   #define BlendColorDodgef(base, blend)   ((blend == 1.0) ? blend : min(base / (1.0 - blend), 1.0))'
    .endl()+'   colNew=Blend(base, blend, BlendColorDodgef);'
    .endl()+'#endif'

    .endl()+'#ifdef BM_COLORBURN'
    .endl()+'   #define BlendColorBurnf(base, blend)    ((blend == 0.0) ? blend : max((1.0 - ((1.0 - base) / blend)), 0.0))'
    .endl()+'   colNew=Blend(base, blend, BlendColorBurnf);'
    .endl()+'#endif'




    .endl()+'#ifdef REMOVE_ALPHA_SRC'
    .endl()+'   blendRGBA.a=1.0;'
    .endl()+'#endif'

    .endl()+'#ifdef HAS_TEXTUREALPHA'

    .endl()+'   vec4 colImgAlpha=texture2D(imageAlpha,texCoord);'
    .endl()+'   float colImgAlphaAlpha=colImgAlpha.a;'

    .endl()+'   #ifdef INVERT_ALPHA'
    .endl()+'       colImgAlphaAlpha=1.0-colImgAlphaAlpha;'
    .endl()+'   #endif'


    .endl()+'   #ifdef ALPHA_FROM_LUMINANCE'
    .endl()+'       vec3 gray = vec3(dot(vec3(0.2126,0.7152,0.0722), colImgAlpha.rgb ));'
    .endl()+'       colImgAlphaAlpha=(gray.r+gray.g+gray.b)/3.0;'
    .endl()+'   #endif'

    .endl()+'   blendRGBA.a=colImgAlphaAlpha*blendRGBA.a;'


    .endl()+'#endif'


    // .endl()+'vec4 finalColor=vec4(colNew*amount*blendRGBA.a,blendRGBA.a);'
    // .endl()+'finalColor+=vec4(base*(1.0-amount)*baseRGBA.a,baseRGBA.a);'//, base ,1.0-blendRGBA.a*amount);'
    .endl()+'blendRGBA.rgb=mix( colNew, base ,1.0-blendRGBA.a*amount);'
    .endl()+'blendRGBA.a=baseRGBA.a+blendRGBA.a;'


    // .endl()+'blendRGBA.rgb=mix( colNew, base ,1.0-blendRGBA.a*amount);'
    // .endl()+'blendRGBA.a=alpha;'

    .endl()+'#endif'


    .endl()+'   gl_FragColor = blendRGBA;'
    .endl()+'}';

shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var textureDisplaceUniform=new CGL.Uniform(shader,'t','image',1);
var textureAlpha=new CGL.Uniform(shader,'t','imageAlpha',2);

this.invAlphaChannel.onValueChanged=function()
{
    if(self.invAlphaChannel.val) shader.define('INVERT_ALPHA');
        else shader.removeDefine('INVERT_ALPHA');
    shader.compile();
};

this.removeAlphaSrc.onValueChanged=function()
{
    if(self.removeAlphaSrc.val) shader.define('REMOVE_ALPHA_SRC');
        else shader.removeDefine('REMOVE_ALPHA_SRC');
    shader.compile();
};
this.removeAlphaSrc.set(true);

this.alphaSrc.onValueChanged=function()
{
    if(self.alphaSrc.val=='luminance') shader.define('ALPHA_FROM_LUMINANCE');
        else shader.removeDefine('ALPHA_FROM_LUMINANCE');
    shader.compile();
};

this.alphaSrc.val="alpha channel";


{
    //
    // texture flip
    //
    var flipX=this.addInPort(new Port(this,"flip x",OP_PORT_TYPE_VALUE,{ display:'bool' }));
    var flipY=this.addInPort(new Port(this,"flip y",OP_PORT_TYPE_VALUE,{ display:'bool' }));
    
    flipX.onValueChanged=function()
    {
        if(flipX.get()) shader.define('TEX_FLIP_X');
            else shader.removeDefine('TEX_FLIP_X');
    };
    
    flipY.onValueChanged=function()
    {
        if(flipY.get()) shader.define('TEX_FLIP_Y');
            else shader.removeDefine('TEX_FLIP_Y');
    };
}

{
    //
    // texture transform
    //
    var scale=this.addInPort(new Port(this,"scale",OP_PORT_TYPE_VALUE,{ display:'range' }));
    var posX=this.addInPort(new Port(this,"pos x",OP_PORT_TYPE_VALUE,{  }));
    var posY=this.addInPort(new Port(this,"pos y",OP_PORT_TYPE_VALUE,{  }));

    scale.set(1.0);

    var uniScale=new CGL.Uniform(shader,'f','scale',scale.get());
    var uniPosX=new CGL.Uniform(shader,'f','posX',posX.get());
    var uniPosY=new CGL.Uniform(shader,'f','posY',posY.get());

    function updateTransform()
    {
        // console.log('tex trans!!');
        if(scale.get()!=1.0 || posX.get()!=0.0 || posY.get()!=0.0 )
        {
            if(!shader.hasDefine('TEX_TRANSFORM'))shader.define('TEX_TRANSFORM');
            uniScale.setValue( parseFloat(scale.get()) );
            uniPosX.setValue( posX.get() );
            uniPosY.setValue( posY.get() );
        }
        else
        {
            shader.removeDefine('TEX_TRANSFORM');   
        }
    }
    
    scale.onValueChange(updateTransform);
    posX.onValueChange(updateTransform);
    posY.onValueChange(updateTransform);

}


this.blendMode.onValueChanged=function()
{
    if(self.blendMode.val=='normal') shader.define('BM_NORMAL');
        else shader.removeDefine('BM_NORMAL');

    if(self.blendMode.val=='multiply') shader.define('BM_MULTIPLY');
        else shader.removeDefine('BM_MULTIPLY');

    if(self.blendMode.val=='average') shader.define('BM_AVERAGE');
        else shader.removeDefine('BM_AVERAGE');

    if(self.blendMode.val=='add') shader.define('BM_ADD');
        else shader.removeDefine('BM_ADD');

    if(self.blendMode.val=='substract') shader.define('BM_SUBSTRACT');
        else shader.removeDefine('BM_SUBSTRACT');

    if(self.blendMode.val=='difference') shader.define('BM_DIFFERENCE');
        else shader.removeDefine('BM_DIFFERENCE');

    if(self.blendMode.val=='negation') shader.define('BM_NEGATION');
        else shader.removeDefine('BM_NEGATION');

    if(self.blendMode.val=='exclusion') shader.define('BM_EXCLUSION');
        else shader.removeDefine('BM_EXCLUSION');

    if(self.blendMode.val=='lighten') shader.define('BM_LIGHTEN');
        else shader.removeDefine('BM_LIGHTEN');

    if(self.blendMode.val=='darken') shader.define('BM_DARKEN');
        else shader.removeDefine('BM_DARKEN');

    if(self.blendMode.val=='overlay') shader.define('BM_OVERLAY');
        else shader.removeDefine('BM_OVERLAY');

    if(self.blendMode.val=='screen') shader.define('BM_SCREEN');
        else shader.removeDefine('BM_SCREEN');

    if(self.blendMode.val=='softlight') shader.define('BM_SOFTLIGHT');
        else shader.removeDefine('BM_SOFTLIGHT');

    if(self.blendMode.val=='hardlight') shader.define('BM_HARDLIGHT');
        else shader.removeDefine('BM_HARDLIGHT');

    if(self.blendMode.val=='color dodge') shader.define('BM_COLORDODGE');
        else shader.removeDefine('BM_COLORDODGE');

    if(self.blendMode.val=='color burn') shader.define('BM_COLORBURN');
        else shader.removeDefine('BM_COLORBURN');

    shader.compile();
};

var amountUniform=new CGL.Uniform(shader,'f','amount',1.0);

this.amount.onValueChanged=function()
{
    amountUniform.setValue(self.amount.val);
};
self.amount.val=1.0;

this.imageAlpha.onValueChanged=function()
{
    if(self.imageAlpha.val && self.imageAlpha.val.tex) shader.define('HAS_TEXTUREALPHA');
        else shader.removeDefine('HAS_TEXTUREALPHA');
    shader.compile();
};

function render()
{
    if(!cgl.currentTextureEffect)return;

    if(self.image.val && self.image.val.tex)
    {

        cgl.setShader(shader);
        cgl.currentTextureEffect.bind();

        cgl.gl.activeTexture(cgl.gl.TEXTURE0);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

        cgl.gl.activeTexture(cgl.gl.TEXTURE1);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, self.image.val.tex );

        if(self.imageAlpha.val && self.imageAlpha.val.tex)
        {
            cgl.gl.activeTexture(cgl.gl.TEXTURE2);
            cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, self.imageAlpha.val.tex );
        }

        cgl.currentTextureEffect.finish();
        cgl.setPreviousShader();
    }

    self.trigger.trigger();
}

function preview()
{
    render();
    self.image.val.preview();
}

function previewAlpha()
{
    render();
    self.imageAlpha.val.preview();
}

this.image.onPreviewChanged=function()
{
    if(self.image.showPreview) self.render.onTriggered=preview;
    else self.render.onTriggered=render;
};

this.imageAlpha.onPreviewChanged=function()
{
    if(self.imageAlpha.showPreview) self.render.onTriggered=previewAlpha;
    else self.render.onTriggered=render;
};

this.render.onTriggered=render;

