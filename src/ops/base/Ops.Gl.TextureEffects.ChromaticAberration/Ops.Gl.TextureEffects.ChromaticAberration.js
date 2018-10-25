op.name="ChromaticAberration";

var render=op.addInPort(new CABLES.Port(op,"render",CABLES.OP_PORT_TYPE_FUNCTION));
var pixel=op.inValue("Pixel",5);
var lensDistort=op.inValueSlider("Lens Distort",0);

var textureMask=op.inTexture("Mask");

var doSmooth=op.inValueBool("Smooth",false);

var trigger=op.addOutPort(new CABLES.Port(op,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);


doSmooth.onChange=function()
{
    if(doSmooth.get())shader.define("SMOOTH");
        else shader.removeDefine("SMOOTH");
};

textureMask.onChange=function()
{
    if(textureMask.get())shader.define("MASK");
        else shader.removeDefine("MASK");
};


shader.setSource(shader.getDefaultVertexShader(),attachments.chromatic_frag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var uniPixel=new CGL.Uniform(shader,'f','pixel',0);
var uniOnePixel=new CGL.Uniform(shader,'f','onePixel',0);
var unitexMask=new CGL.Uniform(shader,'t','texMask',1);

var unilensDistort=new CGL.Uniform(shader,'f','lensDistort',lensDistort);

render.onTriggered=function()
{
    if(!cgl.currentTextureEffect)return;

    var texture=cgl.currentTextureEffect.getCurrentSourceTexture();

    uniPixel.setValue(pixel.get()*(1/texture.width));
    uniOnePixel.setValue(1/texture.width);

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    /* --- */cgl.setTexture(0, texture.tex );
    // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, texture.tex );
    
    if(textureMask.get())
    {
        /* --- */cgl.setTexture(1, textureMask.get().tex );
        // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, textureMask.get().tex );
        
    }
    
    

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};
