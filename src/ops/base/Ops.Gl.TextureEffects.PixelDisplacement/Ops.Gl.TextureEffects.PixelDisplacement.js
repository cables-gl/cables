CABLES.Op.apply(this, arguments);
var self=this;
var cgl=this.patch.cgl;

this.name='PixelDisplacement';

this.render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));

this.amount=this.addInPort(new Port(this,"amountX",OP_PORT_TYPE_VALUE,{ display:'range' }));
this.amountY=this.addInPort(new Port(this,"amountY",OP_PORT_TYPE_VALUE,{ display:'range' }));
this.displaceTex=this.addInPort(new Port(this,"displaceTex",OP_PORT_TYPE_TEXTURE));
this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

var shader=new CGL.Shader(cgl);
this.onLoaded=shader.compile;

var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'#ifdef HAS_TEXTURES'
    .endl()+'  varying vec2 texCoord;'
    .endl()+'  uniform sampler2D tex;'
    .endl()+'  uniform sampler2D displaceTex;'
    .endl()+'#endif'
    .endl()+'uniform float amountX;'
    .endl()+'uniform float amountY;'
    .endl()+''
    .endl()+''
    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec4 col=vec4(1.0,0.0,0.0,1.0);'
    .endl()+'   #ifdef HAS_TEXTURES'
    .endl()+' float mulX=1.0;'
    .endl()+' float mulY=1.0;'
    .endl()+' float x=mod(texCoord.x+mulX*texture2D(displaceTex,texCoord).g*1.0*amountX,1.0);'
    .endl()+' float y=mod(texCoord.y+mulY*texture2D(displaceTex,texCoord).g*1.0*amountY,1.0);'
    .endl()+''
    .endl()+'       col=texture2D(tex,vec2(x,y) );'
    // .endl()+'       col.rgb=desaturate(col.rgb,amount);'
    .endl()+'   #endif'
    .endl()+'   gl_FragColor = col;'
    .endl()+'}';

shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var textureDisplaceUniform=new CGL.Uniform(shader,'t','displaceTex',1);

var amountXUniform=new CGL.Uniform(shader,'f','amountX',0.0);
var amountYUniform=new CGL.Uniform(shader,'f','amountY',0.0);

this.amount.onValueChanged=function()
{
    amountXUniform.setValue(self.amount.val);
};

this.amountY.onValueChanged=function()
{
    amountYUniform.setValue(self.amountY.val);
};

this.render.onTriggered=function()
{
    if(!cgl.currentTextureEffect)return;

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.gl.activeTexture(cgl.gl.TEXTURE0);
    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    if(self.displaceTex.val)
    {
        cgl.gl.activeTexture(cgl.gl.TEXTURE1);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, self.displaceTex.val.tex );
    }

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    self.trigger.trigger();
};

self.amount.val=0.0;
self.amountY.val=0.0;