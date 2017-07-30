op.name='Scroll';
var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var amountX=op.inValue("amountX");
var amountY=op.inValue("amountY");

var repeat=op.inValueBool("Repeat",true);

repeat.onChange=updateRepeat;



var cgl=op.patch.cgl;
var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'#ifdef HAS_TEXTURES'
    .endl()+'  varying vec2 texCoord;'
    .endl()+'  uniform sampler2D tex;'
    .endl()+'#endif'
    .endl()+''
    .endl()+'uniform float amountX;'
    .endl()+'uniform float amountY;'
    .endl()+''
    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec4 col=vec4(0.0,0.0,0.0,1.0);'
    .endl()+'   #ifdef HAS_TEXTURES'
    
    
    .endl()+'   float x=mod(texCoord.x+amountX,1.0);'
    .endl()+'   float y=mod(texCoord.y+amountY,1.0);'
    
    .endl()+'   #ifdef NO_REPEAT'
    
    .endl()+'       x=texCoord.x+amountX*0.1;'
    .endl()+'       y=texCoord.y+amountY*0.1;'
    

    .endl()+'   #endif'
    
    
    
    .endl()+'       col=texture2D(tex,vec2(x,y));'

    .endl()+'   #ifdef NO_REPEAT'
    .endl()+'   if(x>1.0 || x<0.0 || y>1.0 || y<0.0) col=vec4(0.0,0.0,0.0,1.0);'
    .endl()+'   #endif'

    .endl()+'   #endif'
    .endl()+'   gl_FragColor = col;'
    .endl()+'}';

var shader=new CGL.Shader(cgl);
shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var amountXUniform=new CGL.Uniform(shader,'f','amountX',amountX);
var amountYUniform=new CGL.Uniform(shader,'f','amountY',amountY);

updateRepeat();

function updateRepeat()
{
    if(!repeat.get())shader.define("NO_REPEAT");
    else shader.removeDefine("NO_REPEAT");
}

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
