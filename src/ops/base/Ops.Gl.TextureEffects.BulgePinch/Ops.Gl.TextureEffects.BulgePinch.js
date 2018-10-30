var cgl=op.patch.cgl;

op.name='BulgePinch';

var render=op.addInPort(new CABLES.Port(op,"render",CABLES.OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new CABLES.Port(op,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));

var shader=new CGL.Shader(cgl);
//op.onLoaded=shader.compile;

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

var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'IN vec2 texCoord;'
    .endl()+'UNI sampler2D tex;'

    .endl()+'UNI float radius;'
    .endl()+'UNI float strength;'
    .endl()+'UNI float centerX;'
    .endl()+'UNI float centerY;'


    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec2 center=vec2(centerX,centerY);'
    .endl()+'   vec2 coord=texCoord;'
    .endl()+'   coord -= center;'
    .endl()+'   float distance = length(coord);'
    .endl()+'   float percent = distance / radius;'
    .endl()+'   if (strength > 0.0) coord *= mix(1.0, smoothstep(0.0, radius / distance, percent), strength * 0.75);'
    .endl()+'   else coord *= mix(1.0, pow(percent, 1.0 + strength * 0.75) * radius / distance, 1.0 - percent);'
    .endl()+'   coord += center;'
    .endl()+'   vec4 col=texture2D(tex,coord);'
    .endl()+'   gl_FragColor = col;'
    .endl()+'}';

shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);


render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    /* --- */cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );
    // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};
