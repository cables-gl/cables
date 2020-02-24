const
    render=op.inTrigger('render'),
    radius=op.inValueFloat("Radius",0.5),
    strength=op.inValueFloat("Strength",1),
    centerX=op.inValueFloat("Center X",0.5),
    centerY=op.inValueFloat("Center Y",0.5),
    trigger=op.outTrigger('trigger');

const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl,'bulgepinch');
shader.setSource(shader.getDefaultVertexShader(),attachments.bulgepinch_frag);

const
    uniRadius=new CGL.Uniform(shader,'f','radius',radius),
    uniStrength=new CGL.Uniform(shader,'f','strength',strength),
    uniCenterX=new CGL.Uniform(shader,'f','centerX',centerX),
    uniCenterY=new CGL.Uniform(shader,'f','centerY',centerY),
    textureUniform=new CGL.Uniform(shader,'t','tex',0);

render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
