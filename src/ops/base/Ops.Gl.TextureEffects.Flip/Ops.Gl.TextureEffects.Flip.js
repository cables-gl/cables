op.name="Flip";

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var x=op.inValueBool("X");
var y=op.inValueBool("Y");

var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);
op.onLoaded=shader.compile;


var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'#ifdef HAS_TEXTURES'
    .endl()+'  IN vec2 texCoord;'
    .endl()+'  uniform sampler2D tex;'
    .endl()+'#endif'
    .endl()+'uniform float x;'
    .endl()+'uniform float y;'
    .endl()+''
    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec4 col=vec4(1.0,0.0,0.0,1.0);'
    .endl()+'   #ifdef HAS_TEXTURES'
    .endl()+'       col=texture2D(tex,vec2(abs(x-texCoord.x),abs(y-texCoord.y)));'

    .endl()+'   #endif'
    .endl()+'   gl_FragColor = col;'
    .endl()+'}\n';

shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);

var uniX=new CGL.Uniform(shader,'f','x',x);
var uniY=new CGL.Uniform(shader,'f','y',y);

render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.gl.activeTexture(cgl.gl.TEXTURE0);
    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};
