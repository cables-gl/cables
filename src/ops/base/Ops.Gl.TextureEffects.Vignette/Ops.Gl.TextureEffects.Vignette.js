op.name='Vignette';

var render=op.inFunction("render");
var trigger=op.outFunction("trigger");

var amount=op.inValueSlider("Amount",1);
var lensRadius1=op.inValue("lensRadius1",0.8);
var lensRadius2=op.inValue("lensRadius2",0.4);
var ratio=op.inValue("Ratio",1);

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);


var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'#ifdef HAS_TEXTURES'
    .endl()+'  varying vec2 texCoord;'
    .endl()+'  uniform sampler2D tex;'
    .endl()+'#endif'
    .endl()+'uniform float lensRadius1;'
    .endl()+'uniform float lensRadius2;'
    .endl()+'uniform float ratio;'
    .endl()+'uniform float amount;'

    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec4 col=vec4(1.0,0.0,0.0,1.0);'
    .endl()+'   #ifdef HAS_TEXTURES'
    .endl()+'       col=texture2D(tex,texCoord);'
    .endl()+'       vec2 tcPos=vec2(texCoord.x,(texCoord.y-0.5)*ratio+0.5);'

    .endl()+'       float dist = distance(tcPos, vec2(0.5,0.5))*amount;'
    .endl()+'       col.rgb *= smoothstep(lensRadius1, lensRadius2, dist);'
    .endl()+'   #endif'
    .endl()+'   gl_FragColor = col;'
    .endl()+'}';

shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var uniLensRadius1=new CGL.Uniform(shader,'f','lensRadius1',lensRadius1);
var uniLensRadius2=new CGL.Uniform(shader,'f','lensRadius2',lensRadius2);
var uniRatio=new CGL.Uniform(shader,'f','ratio',ratio);
var uniAmount=new CGL.Uniform(shader,'f','amount',amount);


render.onTriggered=function()
{
    if(CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.gl.activeTexture(cgl.gl.TEXTURE0);
    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};
