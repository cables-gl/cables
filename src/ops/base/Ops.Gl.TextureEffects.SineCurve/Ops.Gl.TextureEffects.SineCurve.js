
var render=op.addInPort(new CABLES.Port(op,"render",CABLES.OP_PORT_TYPE_FUNCTION));

var blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal");
var amount=op.inValueSlider("Amount",1);

var fill=op.inValueBool("Fill",false);
var offset=op.inValue("offset",0);
var frequency=op.inValue("frequency",10);
var amplitude=op.inValueSlider("amplitude",1);
var thick=op.inValueSlider("Thickness",0.1);

var flip=op.inValueBool("Flip",false);

var trigger=op.addOutPort(new CABLES.Port(op,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);
var tsize=[128,128];

var srcFrag=attachments.sinecurve_frag;
srcFrag=srcFrag.replace('{{BLENDCODE}}',CGL.TextureEffect.getBlendCode());


shader.setSource(shader.getDefaultVertexShader(),srcFrag );
var textureUniform=new CGL.Uniform(shader,'t','tex',0);

var offsetUniform=new CGL.Uniform(shader,'f','offset',offset);
var frequencyUniform=new CGL.Uniform(shader,'f','frequency',frequency);
var amplitudeUniform=new CGL.Uniform(shader,'f','amplitude',amplitude);
var thickUniform=new CGL.Uniform(shader,'f','thick',thick);
var texSizeUniform=new CGL.Uniform(shader,'2f','texSize',tsize);
var amountUniform=new CGL.Uniform(shader,'f','amount',amount);

flip.onChange=updateFlip;
fill.onChange=updateFill;

function updateFlip()
{
    if(flip.get()) shader.define('FLIP');
        else shader.removeDefine('FLIP');
}

function updateFill()
{
    if(fill.get()) shader.define('FILL');
        else shader.removeDefine('FILL');
}

blendMode.onChange=function()
{
    CGL.TextureEffect.onChangeBlendSelect(shader,blendMode.get());
};


render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    tsize[0]=cgl.currentTextureEffect.getCurrentSourceTexture().width;
    tsize[1]=cgl.currentTextureEffect.getCurrentSourceTexture().height;
    texSizeUniform.setValue(tsize);

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    /* --- */cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );
    // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};
