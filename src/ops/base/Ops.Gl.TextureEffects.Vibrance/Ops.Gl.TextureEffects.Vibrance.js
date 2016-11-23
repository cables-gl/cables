op.name="Vibrance";

var render=op.inFunction("Render");
var trigger=op.outFunction("Trigger");

var amount=op.inValue("amount",2);

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);
op.onLoaded=shader.compile;

var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'varying vec2 texCoord;'
    .endl()+'uniform sampler2D tex;'
    .endl()+'uniform float amount;'
    .endl()+''

    .endl()+'const vec4 lumcoeff = vec4(0.299,0.587,0.114, 0.);'

    .endl()+''
    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec4 col=vec4(1.0,0.0,0.0,1.0);'
    .endl()+'   col=texture2D(tex,texCoord);'


    .endl()+'   float luma = dot(col, lumcoeff);'
    .endl()+'   vec4 mask = (col - vec4(luma));'
    .endl()+'   mask = clamp(mask, 0.0, 1.0);'
    .endl()+'   float lumaMask = dot(lumcoeff, mask);'
    .endl()+'   lumaMask = 1.0 - lumaMask;'
    .endl()+'   vec4 vibrance = mix(vec4(luma), col, 1.0 + amount * lumaMask);'
    .endl()+'   gl_FragColor = vibrance;'

    .endl()+'}';

shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var amountUniform=new CGL.Uniform(shader,'f','amount',amount)


render.onTriggered=function()
{
    if(!cgl.currentTextureEffect)return;

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.gl.activeTexture(cgl.gl.TEXTURE0);
    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};
