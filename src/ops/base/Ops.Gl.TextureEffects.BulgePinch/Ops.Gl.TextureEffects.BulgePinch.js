const render=op.inTrigger('render');
const trigger=op.outTrigger('trigger');

const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl);

var radius=op.addInPort(new CABLES.Port(op,"Radius",CABLES.OP_PORT_TYPE_VALUE,{  }));
radius.set(0.5);
var uniRadius=new CGL.Uniform(shader,'f','radius',radius.get());
radius.onChange=function() { uniRadius.setValue(radius.get()); };

var strength=op.addInPort(new CABLES.Port(op,"Strength",CABLES.OP_PORT_TYPE_VALUE,{  }));
strength.set(1);
var uniStrength=new CGL.Uniform(shader,'f','strength',strength.get());
strength.onChange=function() { uniStrength.setValue(strength.get()); };

var centerX=op.addInPort(new CABLES.Port(op,"Center X",CABLES.OP_PORT_TYPE_VALUE,{  }));
centerX.set(0.5);
var uniCenterX=new CGL.Uniform(shader,'f','centerX',centerX.get());
centerX.onChange=function() { uniCenterX.setValue(centerX.get()); };

var centerY=op.addInPort(new CABLES.Port(op,"Center Y",CABLES.OP_PORT_TYPE_VALUE,{  }));
centerY.set(0.5);
var uniCenterY=new CGL.Uniform(shader,'f','centerY',centerY.get());
centerY.onChange=function() { uniCenterY.setValue(centerY.get()); };

shader.setSource(shader.getDefaultVertexShader(),attachments.bulgepinch_frag);
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
