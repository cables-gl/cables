op.name="CheckerBoard";

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var lineSize=op.inValue("Size",10);

var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);
op.onLoaded=shader.compile;

var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'uniform float lineSize;'
    .endl()+'varying vec2 texCoord;'

    .endl()+'void main()'
    .endl()+'{'

    .endl()+'   float total = floor(texCoord.x*lineSize) +floor(texCoord.y*lineSize);'
    .endl()+'   float r = mod(total,2.0);'

    .endl()+'   vec4 col=vec4(r,r,r,1.0);'
    
    .endl()+'   gl_FragColor = col;'
    .endl()+'}';

shader.setSource(shader.getDefaultVertexShader(),srcFrag);

var uniLineSize=new CGL.Uniform(shader,'f','lineSize',lineSize);


render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    // cgl.gl.activeTexture(cgl.gl.TEXTURE0);
    // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};
