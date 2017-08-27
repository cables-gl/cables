var cgl=op.patch.cgl;

op.name='BrightnessContrast';

var render=op.inFunction("render");
var amount=op.inValueSlider('contrast');
var amountBright=op.inValueSlider('brightness');

var trigger=op.outFunction('trigger');

var shader=new CGL.Shader(cgl);
op.onLoaded=shader.compile;

amountBright.set(0.5);
amount.set(0.5);

var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'#ifdef HAS_TEXTURES'
    .endl()+'  IN vec2 texCoord;'
    .endl()+'  uniform sampler2D tex;'
    .endl()+'#endif'
    .endl()+'uniform float amount;'
    .endl()+'uniform float amountbright;'
    .endl()+''
    .endl()+''
    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec4 col=vec4(1.0,0.0,0.0,1.0);'
    .endl()+'   #ifdef HAS_TEXTURES'
    .endl()+'       col=texture2D(tex,texCoord);'

    .endl()+'       // appl y contrast'
    .endl()+'       col.rgb = ((col.rgb - 0.5) * max(amount*2.0, 0.0))+0.5;'

    .endl()+'       // appl y brightness'
    .endl()+'       col.rgb *= amountbright*2.0;'

    .endl()+'   #endif'
    .endl()+'   gl_FragColor = col;'
    .endl()+'}';

shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var amountUniform=new CGL.Uniform(shader,'f','amount',amount);
var amountBrightUniform=new CGL.Uniform(shader,'f','amountbright',amountBright);


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