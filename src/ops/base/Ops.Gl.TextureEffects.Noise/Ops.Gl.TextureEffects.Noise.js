
op.name='Noise';
var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var amount=op.addInPort(new Port(op,"amount",OP_PORT_TYPE_VALUE,{display:'range'}));

var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);
op.onLoaded=shader.compile;

var amountUniform=new CGL.Uniform(shader,'f','amount',1.0);
var timeUniform=new CGL.Uniform(shader,'f','time',1.0);

amount.onValueChanged=function(){amountUniform.setValue(amount.get());};

amount.set(0.3);

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

render.onTriggered=function()
{
    if(!cgl.currentTextureEffect)return;

    timeUniform.setValue(op.patch.timer.getTime());

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.gl.activeTexture(cgl.gl.TEXTURE0);
    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};

