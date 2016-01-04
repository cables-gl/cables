CABLES.Op.apply(this, arguments);
var self=this;
var cgl=this.patch.cgl;

this.name='Scroll';
this.render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

this.amountX=this.addInPort(new Port(this,"amountX",OP_PORT_TYPE_VALUE));
this.amountY=this.addInPort(new Port(this,"amountY",OP_PORT_TYPE_VALUE));

var shader=new CGL.Shader(cgl);
this.onLoaded=shader.compile;

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
    .endl()+'}\n';

shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);


this.render.onTriggered=function()
{
    if(!cgl.currentTextureEffect)return;

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.gl.activeTexture(cgl.gl.TEXTURE0);
    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    self.trigger.trigger();
};

var amountXUniform=new CGL.Uniform(shader,'f','amountX',1.0);

this.amountX.onValueChanged=function()
{
    amountXUniform.setValue(self.amountX.val);
};

var amountYUniform=new CGL.Uniform(shader,'f','amountY',1.0);

this.amountY.onValueChanged=function()
{
    amountYUniform.setValue(self.amountY.val);
};

this.amountY.val=0.0;
this.amountX.val=0.0;