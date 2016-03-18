CABLES.Op.apply(this, arguments);
var self=this;
var cgl=this.patch.cgl;

this.name='Noise';
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
    .endl()+'uniform float time;'

    .endl()+'float random(vec2 co)'
    .endl()+'{'
    .endl()+'   return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);'
    .endl()+'}'

    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   float c=random((time+0.232323)*texCoord.xy);'
    // .endl()+'   vec4 col=vec4(c,c,c,1.0);'
    .endl()+'   vec4 col=texture2D(tex,texCoord);'
    .endl()+'   col.rgb=mix(col.rgb,vec3(c),amount);'
    // .endl()+'   col.rgb+=vec3(c)*amount;'
    .endl()+'   gl_FragColor = col;'
    .endl()+'}';


shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);

this.render.onTriggered=function()
{
    if(!cgl.currentTextureEffect)return;

    // console.log(self.patch.timer.getTime());
    timeUniform.setValue(self.patch.timer.getTime());

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.gl.activeTexture(cgl.gl.TEXTURE0);
    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    self.trigger.trigger();
};

var amountUniform=new CGL.Uniform(shader,'f','amount',1.0);
var timeUniform=new CGL.Uniform(shader,'f','time',1.0);

this.amount.onValueChanged=function()
{
    amountUniform.setValue(self.amount.val);
};

this.amount.val=0.3;