op.name="Mirror";

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);
op.onLoaded=shader.compile;

var axis=op.addInPort(new Port(op,"axis",OP_PORT_TYPE_VALUE,{display:'dropdown',values:['X','Y']}));
var width=op.addInPort(new Port(op,"width",OP_PORT_TYPE_VALUE,{display:'range'}));
var offset=op.addInPort(new Port(op,"offset",OP_PORT_TYPE_VALUE,{display:'range'}));
var flip=op.addInPort(new Port(op,"flip",OP_PORT_TYPE_VALUE,{display:'bool'}));

width.set(0.5);
var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'#ifdef HAS_TEXTURES'
    .endl()+'  varying vec2 texCoord;'
    .endl()+'  uniform sampler2D tex;'
    .endl()+'#endif'
    .endl()+'uniform float axis;'
    .endl()+'uniform float width;'
    .endl()+'uniform float flip;'
    .endl()+'uniform float offset;'
    .endl()+''
    .endl()+''
    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec4 col=vec4(1.0,0.0,0.0,1.0);'
    .endl()+'   #ifdef HAS_TEXTURES'

    .endl()+'       float tc=texCoord.x;'
    .endl()+'       if(axis==1.0) tc=(texCoord.y);'

    .endl()+'       float x=(tc);'
    .endl()+'       if(tc>=0.5)x=1.0-tc;'

    .endl()+'       x*=width*2.0;'
    .endl()+'       if(flip==1.0)x=1.0-x;'
    .endl()+'       x*=1.0-offset;'

    .endl()+'       if(axis==1.0) col=texture2D(tex,vec2(texCoord.x,x) );'
    .endl()+'           else col=texture2D(tex,vec2(x,texCoord.y) );'

    .endl()+'   #endif'
    .endl()+'   gl_FragColor = col;'
    .endl()+'}';

shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var uniAxis=new CGL.Uniform(shader,'f','axis',0);
var uniWidth=new CGL.Uniform(shader,'f','width',width);
var uniOffset=new CGL.Uniform(shader,'f','offset',offset);
var uniFlip=new CGL.Uniform(shader,'f','flip',0);

flip.onValueChanged=function()
{
    if(flip.get())uniFlip.setValue(1);
    else uniFlip.setValue(0);
};

axis.onValueChanged=function()
{
    if(axis.get()=='X')uniAxis.setValue(0);
    if(axis.get()=='Y')uniAxis.setValue(1);
};

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
