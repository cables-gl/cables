
var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var offset=op.inValue("offset",0);
var frequency=op.inValue("frequency",10);
var amplitude=op.inValueSlider("amplitude",1);

var flip=op.inValueBool("Flip",false);

var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);
var tsize=[128,128];
var srcFrag=attachments.sinecurve_frag;

shader.setSource(shader.getDefaultVertexShader(),srcFrag );
var textureUniform=new CGL.Uniform(shader,'t','tex',0);

var offsetUniform=new CGL.Uniform(shader,'f','offset',offset);
var frequencyUniform=new CGL.Uniform(shader,'f','frequency',frequency);
var amplitudeUniform=new CGL.Uniform(shader,'f','amplitude',amplitude);
var texSizeUniform=new CGL.Uniform(shader,'2f','texSize',tsize);

flip.onChange=updateFlip;

function updateFlip()
{
    if(flip.get()) shader.define('FLIP');
        else shader.removeDefine('FLIP');
}

render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    tsize[0]=cgl.currentTextureEffect.getCurrentSourceTexture().width;
    tsize[1]=cgl.currentTextureEffect.getCurrentSourceTexture().height;
    texSizeUniform.setValue(tsize);

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.gl.activeTexture(cgl.gl.TEXTURE0);
    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};
