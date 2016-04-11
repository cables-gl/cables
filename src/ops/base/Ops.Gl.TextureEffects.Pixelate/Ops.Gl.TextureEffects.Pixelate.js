var self=this;
var cgl=this.patch.cgl;

this.name='Pixelate';

var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));

var amountX=this.addInPort(new Port(this,"width",OP_PORT_TYPE_VALUE,{  }));
var amountY=this.addInPort(new Port(this,"height",OP_PORT_TYPE_VALUE,{  }));
var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

var shader=new CGL.Shader(cgl);
this.onLoaded=shader.compile;

var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'varying vec2 texCoord;'
    .endl()+'uniform sampler2D tex;'
    .endl()+'uniform float amountX;'
    .endl()+'uniform float amountY;'
    .endl()+''
    .endl()+''
    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec4 col=vec4(1.0,0.0,0.0,1.0);'

    .endl()+'   float x=1.0/amountX;'
    .endl()+'   float y=1.0/amountY;'
    .endl()+'   vec2 coord = vec2(x*floor(texCoord.x/x), y*floor(texCoord.y/y));'
    .endl()+'   col=texture2D(tex,coord);'

    .endl()+'   gl_FragColor = col;'
    .endl()+'}';

shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);

var amountXUniform=new CGL.Uniform(shader,'f','amountX',0.0);
var amountYUniform=new CGL.Uniform(shader,'f','amountY',0.0);

amountX.onValueChanged=function()
{
    amountXUniform.setValue(amountX.get());
};

amountY.onValueChanged=function()
{
    amountYUniform.setValue(amountY.get());
};

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

amountX.set(320.0);
amountY.set(180.0);