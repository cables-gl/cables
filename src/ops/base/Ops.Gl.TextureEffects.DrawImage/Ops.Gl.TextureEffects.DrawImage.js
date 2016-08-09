op.name='DrawImage';

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var amount=op.addInPort(new Port(op,"amount",OP_PORT_TYPE_VALUE,{ display:'range' }));

var image=op.addInPort(new Port(op,"image",OP_PORT_TYPE_TEXTURE,{preview:true }));
var blendMode=op.addInPort(new Port(op,"blendMode",OP_PORT_TYPE_VALUE,{ display:'dropdown',values:[
    'normal','lighten','darken','multiply','average','add','substract','difference','negation','exclusion','overlay','screen',
    'color dodge',
    'color burn',
    'softlight',
    'hardlight'
    ] }));
var imageAlpha=op.addInPort(new Port(op,"imageAlpha",OP_PORT_TYPE_TEXTURE,{preview:true }));
var alphaSrc=op.addInPort(new Port(op,"alphaSrc",OP_PORT_TYPE_VALUE,{ display:'dropdown',values:[
    'alpha channel','luminance'
    ] }));
var removeAlphaSrc=op.addInPort(new Port(op,"removeAlphaSrc",OP_PORT_TYPE_VALUE,{ display:'bool' }));

var invAlphaChannel=op.addInPort(new Port(op,"invert alpha channel",OP_PORT_TYPE_VALUE,{ display:'bool' }));


var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

blendMode.set('normal');
var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);
op.onLoaded=shader.compile;

amount.set(1.0);

var srcVert=''
        .endl()+'attribute vec3 vPosition;'
        .endl()+'attribute vec2 attrTexCoord;'
        .endl()+'attribute vec3 attrVertNormal;'
        .endl()+'varying vec2 texCoord;'
        .endl()+'varying vec3 norm;'
        .endl()+'uniform mat4 projMatrix;'
        .endl()+'uniform mat4 mvMatrix;'


        .endl()+'uniform float posX;'
        .endl()+'uniform float posY;'
        .endl()+'uniform float scale;'
        .endl()+'uniform float rotate;'
        
        .endl()+'varying mat3 transform;'

        .endl()+'void main()'
        .endl()+'{'
        .endl()+'   texCoord=attrTexCoord;'
        .endl()+'   norm=attrVertNormal;'

.endl()+'       #ifdef TEX_TRANSFORM'
.endl()+'    vec3 coordinates=vec3(attrTexCoord.x, attrTexCoord.y,1.0);'
.endl()+'    float angle = radians( rotate );'
.endl()+'    vec2 scale= vec2(scale,scale);'
.endl()+'    vec2 translate= vec2(posX,posY);'

// .endl()+'    transform;'
.endl()+'    transform = mat3(   scale.x * cos( angle ), scale.x * sin( angle ), 0.0,'
.endl()+'                           - scale.y * sin( angle ), scale.y * cos( angle ), 0.0,'
.endl()+'                          - 0.5 * scale.x * cos( angle ) + 0.5 * scale.y * sin( angle ) - 0.5 * translate.x + 0.5,  - 0.5 * scale.x * sin( angle ) - 0.5 * scale.y * cos( angle ) - 0.5 * translate.y + 0.5, 1.0);'

.endl()+'       #endif'

        .endl()+'   gl_Position = projMatrix * mvMatrix * vec4(vPosition,  1.0);'
        .endl()+'}';



var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'#ifdef HAS_TEXTURES'
    .endl()+'  varying vec2 texCoord;'
    .endl()+'  uniform sampler2D tex;'
    .endl()+'  uniform sampler2D image;'
    .endl()+'#endif'
    
    .endl()+'varying mat3 transform;'

    .endl()+'   uniform float rotate;'

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
.endl()+'    vec3 coordinates=vec3(tc.x, tc.y,1.0);'
.endl()+'    tc=(transform * coordinates ).xy;'
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

shader.setSource(srcVert,srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var textureDisplaceUniform=new CGL.Uniform(shader,'t','image',1);
var textureAlpha=new CGL.Uniform(shader,'t','imageAlpha',2);

invAlphaChannel.onValueChanged=function()
{
    if(invAlphaChannel.get()) shader.define('INVERT_ALPHA');
        else shader.removeDefine('INVERT_ALPHA');
    shader.compile();
};

removeAlphaSrc.onValueChanged=function()
{
    if(removeAlphaSrc.get()) shader.define('REMOVE_ALPHA_SRC');
        else shader.removeDefine('REMOVE_ALPHA_SRC');
    shader.compile();
};
removeAlphaSrc.set(true);

alphaSrc.onValueChanged=function()
{
    if(alphaSrc.get()=='luminance') shader.define('ALPHA_FROM_LUMINANCE');
        else shader.removeDefine('ALPHA_FROM_LUMINANCE');
    shader.compile();
};

alphaSrc.set("alpha channel");


{
    //
    // texture flip
    //
    var flipX=op.addInPort(new Port(op,"flip x",OP_PORT_TYPE_VALUE,{ display:'bool' }));
    var flipY=op.addInPort(new Port(op,"flip y",OP_PORT_TYPE_VALUE,{ display:'bool' }));
    
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
    var scale=op.addInPort(new Port(op,"scale",OP_PORT_TYPE_VALUE,{ display:'range' }));
    var posX=op.addInPort(new Port(op,"pos x",OP_PORT_TYPE_VALUE, {}));
    var posY=op.addInPort(new Port(op,"pos y",OP_PORT_TYPE_VALUE, {}));
    var rotate=op.addInPort(new Port(op,"rotate",OP_PORT_TYPE_VALUE, {}));

    scale.set(1.0);

    var uniScale=new CGL.Uniform(shader,'f','scale',scale.get());
    var uniPosX=new CGL.Uniform(shader,'f','posX',posX.get());
    var uniPosY=new CGL.Uniform(shader,'f','posY',posY.get());
    var uniRotate=new CGL.Uniform(shader,'f','rotate',rotate.get());

    function updateTransform()
    {
        if(scale.get()!=1.0 || posX.get()!=0.0 || posY.get()!=0.0 || rotate.get()!=0.0 )
        {
            if(!shader.hasDefine('TEX_TRANSFORM')) shader.define('TEX_TRANSFORM');
            uniScale.setValue( parseFloat(scale.get()) );
            uniPosX.setValue( posX.get() );
            uniPosY.setValue( posY.get() );
            uniRotate.setValue( rotate.get() );
        }
        else
        {
            shader.removeDefine('TEX_TRANSFORM');   
        }
    }
    
    scale.onValueChange(updateTransform);
    posX.onValueChange(updateTransform);
    posY.onValueChange(updateTransform);
    rotate.onValueChange(updateTransform);

}


blendMode.onValueChanged=function()
{
    if(blendMode.get()=='normal') shader.define('BM_NORMAL');
        else shader.removeDefine('BM_NORMAL');

    if(blendMode.get()=='multiply') shader.define('BM_MULTIPLY');
        else shader.removeDefine('BM_MULTIPLY');

    if(blendMode.get()=='average') shader.define('BM_AVERAGE');
        else shader.removeDefine('BM_AVERAGE');

    if(blendMode.get()=='add') shader.define('BM_ADD');
        else shader.removeDefine('BM_ADD');

    if(blendMode.get()=='substract') shader.define('BM_SUBSTRACT');
        else shader.removeDefine('BM_SUBSTRACT');

    if(blendMode.get()=='difference') shader.define('BM_DIFFERENCE');
        else shader.removeDefine('BM_DIFFERENCE');

    if(blendMode.get()=='negation') shader.define('BM_NEGATION');
        else shader.removeDefine('BM_NEGATION');

    if(blendMode.get()=='exclusion') shader.define('BM_EXCLUSION');
        else shader.removeDefine('BM_EXCLUSION');

    if(blendMode.get()=='lighten') shader.define('BM_LIGHTEN');
        else shader.removeDefine('BM_LIGHTEN');

    if(blendMode.get()=='darken') shader.define('BM_DARKEN');
        else shader.removeDefine('BM_DARKEN');

    if(blendMode.get()=='overlay') shader.define('BM_OVERLAY');
        else shader.removeDefine('BM_OVERLAY');

    if(blendMode.get()=='screen') shader.define('BM_SCREEN');
        else shader.removeDefine('BM_SCREEN');

    if(blendMode.get()=='softlight') shader.define('BM_SOFTLIGHT');
        else shader.removeDefine('BM_SOFTLIGHT');

    if(blendMode.get()=='hardlight') shader.define('BM_HARDLIGHT');
        else shader.removeDefine('BM_HARDLIGHT');

    if(blendMode.get()=='color dodge') shader.define('BM_COLORDODGE');
        else shader.removeDefine('BM_COLORDODGE');

    if(blendMode.get()=='color burn') shader.define('BM_COLORBURN');
        else shader.removeDefine('BM_COLORBURN');

    shader.compile();
};

var amountUniform=new CGL.Uniform(shader,'f','amount',amount.get());

amount.onValueChanged=function()
{
    amountUniform.setValue(amount.get());
};


imageAlpha.onValueChanged=function()
{
    if(imageAlpha.get() && imageAlpha.get().tex) shader.define('HAS_TEXTUREALPHA');
        else shader.removeDefine('HAS_TEXTUREALPHA');
    shader.compile();
};

function doRender()
{
    if(!cgl.currentTextureEffect)return;

    if(image.get() && image.get().tex)
    {

        cgl.setShader(shader);
        cgl.currentTextureEffect.bind();

        cgl.gl.activeTexture(cgl.gl.TEXTURE0);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

        cgl.gl.activeTexture(cgl.gl.TEXTURE1);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, image.get().tex );

        if(imageAlpha.get() && imageAlpha.get().tex)
        {
            cgl.gl.activeTexture(cgl.gl.TEXTURE2);
            cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, imageAlpha.get().tex );
        }

        cgl.currentTextureEffect.finish();
        cgl.setPreviousShader();
    }

    trigger.trigger();
}

function preview()
{
    doRender();
    image.get().preview();
}

function previewAlpha()
{
    doRender();
    imageAlpha.get().preview();
}

image.onPreviewChanged=function()
{
    if(image.showPreview) render.onTriggered=preview;
        else render.onTriggered=doRender;
};

imageAlpha.onPreviewChanged=function()
{
    if(imageAlpha.showPreview) render.onTriggered=previewAlpha;
        else render.onTriggered=doRender;
};

render.onTriggered=doRender;

