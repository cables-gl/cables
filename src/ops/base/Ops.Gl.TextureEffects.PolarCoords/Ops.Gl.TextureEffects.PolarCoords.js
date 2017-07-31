op.name="PolarCoords";

var render=op.inFunction("render");

var inner=op.inValueSlider("Radius Inner",0.25);
var outer=op.inValueSlider("Radius Outer",0.5);

var trigger=op.outFunction('trigger');
var cgl=op.patch.cgl;

var shader=new CGL.Shader(cgl);

var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'#ifdef HAS_TEXTURES'
    .endl()+'  varying vec2 texCoord;'
    .endl()+'  uniform sampler2D tex;'
    .endl()+'#endif'
    .endl()+'uniform float amount;'
    .endl()+'uniform float inner;'
    .endl()+'uniform float outer;'
    .endl()+''
    .endl()+''
    

    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec4 col=vec4(1.0,0.0,0.0,1.0);'
    .endl()+'   #ifdef HAS_TEXTURES'
    
    .endl()+'       vec2 x = texCoord - vec2(0.5);'
    .endl()+'       float radius = length(x);'
    .endl()+'       float angle = atan(x.y, x.x);'

    .endl()+'       vec2 tc;'
    .endl()+'       tc.s = ( radius - inner) / (outer - inner);'
    .endl()+'       tc.t = angle * 0.5 / 3.141592653589793 + 0.5;'

    .endl()+'       col=texture2D(tex,tc);'

    .endl()+'   #endif'
    .endl()+'   gl_FragColor = col;'
    .endl()+'}';

shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);

var inner=new CGL.Uniform(shader,'f','inner',inner);
var outer=new CGL.Uniform(shader,'f','outer',outer);


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