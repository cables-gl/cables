op.name='Scroll';
var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var amountX=op.inValue("amountX");
var amountY=op.inValue("amountY");

var cgl=op.patch.cgl;
var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'#ifdef HAS_TEXTURES'
    .endl()+'  varying vec2 texCoord;'
    .endl()+'  uniform sampler2D tex;'
    .endl()+'#endif'
    .endl()+''
    .endl()+'  uniform float amountX;'
    .endl()+'  uniform float amountY;'
    .endl()+''
    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec4 col=vec4(0.0,0.0,0.0,1.0);'
    .endl()+'   #ifdef HAS_TEXTURES'
    .endl()+'       col=texture2D(tex,vec2(mod(texCoord.x+amountX*0.1,1.0),mod(texCoord.y+amountY*0.1,1.0) ));'
    .endl()+'   #endif'
    .endl()+'   gl_FragColor = col;'
    .endl()+'}';

var shader=new CGL.Shader(cgl);
shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var amountXUniform=new CGL.Uniform(shader,'f','amountX',amountX);
var amountYUniform=new CGL.Uniform(shader,'f','amountY',amountY);


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
