CABLES.Op.apply(this, arguments);
var self=this;
var cgl=this.patch.cgl;

this.name='ChromaticAberration';

this.render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
this.amount=this.addInPort(new Port(this,"amount",OP_PORT_TYPE_VALUE,{display:'range'}));
this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

var shader=new CGL.Shader(cgl);
this.onLoaded=shader.compile;

var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'#ifdef HAS_TEXTURES'
    .endl()+'  varying vec2 texCoord;'
    .endl()+'  uniform sampler2D tex;'
    .endl()+'#endif'
    .endl()+'uniform float amount;'
    .endl()+''
    .endl()+''
    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec4 col=vec4(1.0,0.0,0.0,1.0);'
    .endl()+'   #ifdef HAS_TEXTURES'
    .endl()+'       col=texture2D(tex,texCoord);'
    .endl()+'       vec2 tcPos=vec2(texCoord.x,texCoord.y/1.777+0.25);'
    .endl()+'       float dist = distance(tcPos, vec2(0.5,0.5));'
    .endl()+'       col.r=texture2D(tex,texCoord+(dist)*-amount).r;'
    .endl()+'       col.b=texture2D(tex,texCoord+(dist)*amount).b;'
    .endl()+'   #endif'
    .endl()+'   gl_FragColor = col;'
    .endl()+'}';

shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var uniAmount=new CGL.Uniform(shader,'f','amount',0);

this.amount.onValueChanged=function()
{
    uniAmount.setValue(self.amount.val*0.1);
};
this.amount.val=0.5;

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
