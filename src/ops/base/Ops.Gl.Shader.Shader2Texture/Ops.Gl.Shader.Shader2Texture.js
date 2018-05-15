var exec=op.inFunction("Render");
var inShader=op.inObject("Shader");

var inWidth=op.inValueInt("Width",512);
var inHeight=op.inValueInt("Height",512);
var inFloatingPoint=op.inValueBool("Floating Point",false);

var outTex=op.outTexture("Texture");

var prevViewPort=[0,0,0,0];
var cgl=op.patch.cgl;

var effect=null;

initEffect();

inWidth.onChange=initEffect;
inHeight.onChange=initEffect;
inFloatingPoint.onChange=initEffect;

var tex=null;

function initEffect()
{
    if(effect)effect.delete();
    if(tex)tex.delete();

    effect=new CGL.TextureEffect(cgl,{"isFloatingPointTexture":inFloatingPoint.get()});

    tex=new CGL.Texture(cgl,
        {
            "isFloatingPointTexture":false,
            "filter":CGL.Texture.FILTER_LINEAR,
            "wrap":CGL.Texture.WRAP_CLAMP_TO_EDGE,
            "width": inWidth.get(),
            "height": inHeight.get(),
        });

    effect.setSourceTexture(tex);
    outTex.set(null);
}


exec.onTriggered=function()
{
    var vp=cgl.getViewPort();
    prevViewPort[0]=vp[0];
    prevViewPort[1]=vp[1];
    prevViewPort[2]=vp[2];
    prevViewPort[3]=vp[3];

    cgl.pushBlend(true);



// 			cgl.gl.blendEquationSeparate( cgl.gl.FUNC_ADD, cgl.gl.FUNC_ADD );
// 			cgl.gl.blendFuncSeparate( cgl.gl.SRC_ALPHA, cgl.gl.ONE_MINUS_SRC_ALPHA, cgl.gl.ONE, cgl.gl.ONE_MINUS_SRC_ALPHA );

    // cgl.gl.blendFunc(cgl.gl.SRC_ALPHA, cgl.gl.ONE_MINUS_SRC_ALPHA);
    // cgl.gl.blendFunc(cgl.gl.ONE, cgl.gl.ONE_MINUS_SRC_ALPHA);
    cgl.currentTextureEffect=effect;
    
    effect.startEffect();

    // cgl.gl.clearColor(0,0,0,0);
    // cgl.gl.clear(cgl.gl.COLOR_BUFFER_BIT | cgl.gl.DEPTH_BUFFER_BIT);


    if(inShader.get().bindTextures) inShader.get().bindTextures();

    cgl.setShader(inShader.get());
    cgl.currentTextureEffect.bind();

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();
    
    outTex.set(effect.getCurrentSourceTexture());
    
    effect.endEffect();
    
    cgl.setViewPort(prevViewPort[0],prevViewPort[1],prevViewPort[2],prevViewPort[3]);
    
  
    // cgl.gl.blendFunc(cgl.gl.SRC_ALPHA,cgl.gl.ONE_MINUS_SRC_ALPHA);
  cgl.popBlend();
    
    cgl.currentTextureEffect=null;
};