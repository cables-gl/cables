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
    .endl()+''

    .endl()+'void main()'
    .endl()+'{'

    .endl()+'   vec4 col=vec4(0.0,0.0,0.0,1.0);'
    .endl()+'   float total = floor(texCoord.x*float(lineSize)) +floor(texCoord.y*float(lineSize));'
    .endl()+'   bool isEven = mod(total,2.0)==0.0;'

    .endl()+'   if( isEven) col=vec4(1.0,1.0,1.0,1.0);'

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
