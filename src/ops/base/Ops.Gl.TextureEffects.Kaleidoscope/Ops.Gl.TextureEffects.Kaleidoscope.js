var render=op.inTrigger('Render');

var sides=op.inValue("Sides",10);
var angle=op.inValueSlider("Angle",0);
var slidex=op.inValueSlider("Slide X",0);
var slidey=op.inValueSlider("Slide Y",0);
var centerX=op.inValueSlider("Center X",0.5);
var centerY=op.inValueSlider("Center Y",0.5);

var trigger=op.addOutPort(new CABLES.Port(op,"Next",CABLES.OP_PORT_TYPE_FUNCTION));

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);

var unisides=new CGL.Uniform(shader,'f','sides',sides);
var uniangle=new CGL.Uniform(shader,'f','angle',angle);
var unislidex=new CGL.Uniform(shader,'f','slidex',slidex);
var unislidey=new CGL.Uniform(shader,'f','slidey',slidey);
var uniCenterX=new CGL.Uniform(shader,'f','centerX',centerX);
var uniCenterY=new CGL.Uniform(shader,'f','centerY',centerY);

shader.setSource(shader.getDefaultVertexShader(),attachments.kaleidoscope_frag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);

render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );


    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};
