op.name="BarrelDistortian";


var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var amount=op.inValue("amount");

var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);
op.onLoaded=shader.compile;

// adapted from https://www.shadertoy.com/view/MlSXR3


var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'varying vec2 texCoord;'
    .endl()+'uniform sampler2D tex;'
    .endl()+'uniform float amount;'
    .endl()+''
    
.endl()+'vec2 brownConradyDistortion(vec2 uv)'
.endl()+'{'
    // positive values of K1 give barrel distortion, negative give pincushion
.endl()+'    float barrelDistortion1 = 0.15-amount; // K1 in text books'
.endl()+'    float barrelDistortion2 = 0.0-amount; // K2 in text books'
.endl()+'    float r2 = uv.x*uv.x + uv.y*uv.y;'
.endl()+'    uv *= 1.0 + barrelDistortion1 * r2 + barrelDistortion2 * r2 * r2;'
    
.endl()+'    // tangential distortion (due to off center lens elements)'
.endl()+'    // is not modeled in this function, but if it was, the terms would go here'
.endl()+'    return uv;'
.endl()+'}'

    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec2 tc=brownConradyDistortion(texCoord-0.5)+0.5;'
    .endl()+'   vec4 col=texture2D(tex,tc);'
    .endl()+'   gl_FragColor = col;'
    .endl()+'}';

shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var uniamount=new CGL.Uniform(shader,'f','amount',0);



render.onTriggered=function()
{
    if(!cgl.currentTextureEffect)return;

    var texture=cgl.currentTextureEffect.getCurrentSourceTexture();

    uniamount.setValue(amount.get()*(1/texture.width));

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.gl.activeTexture(cgl.gl.TEXTURE0);
    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, texture.tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};
