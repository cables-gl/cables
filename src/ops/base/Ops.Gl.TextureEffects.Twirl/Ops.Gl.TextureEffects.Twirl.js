op.name="Twirl";

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var amount=op.inValue("amount");
var times=op.inValue("times",1);

var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);
op.onLoaded=shader.compile;


var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'IN vec2 texCoord;'
    .endl()+'uniform sampler2D tex;'
    .endl()+'uniform float amount;'
    .endl()+'uniform float times;'
    .endl()+''
    

    .endl()+'void main()'
    .endl()+'{'
   .endl()+'   vec2 tc = texCoord.st-0.5;'
//   .endl()+'   tc.x+=0.2;'
   
   .endl()+'   float angle = times*atan(tc.y,tc.x);'
   .endl()+'   float radius = length(tc);'
   .endl()+'   angle+= radius*amount*1.0;'
   .endl()+'   vec2 shifted = radius*vec2(cos(angle), sin(angle));'
   .endl()+'   vec4 col = texture2D(tex, (shifted+0.5));'

    .endl()+'   gl_FragColor = col;'
    .endl()+'}';

shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var uniamount=new CGL.Uniform(shader,'f','amount',0);
var unitimes=new CGL.Uniform(shader,'f','times',times);



render.onTriggered=function()
{
    if(!cgl.currentTextureEffect)return;

    var texture=cgl.currentTextureEffect.getCurrentSourceTexture();

    uniamount.setValue(amount.get()*(1/texture.width));

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.gl.activeTexture(cgl.gl.TEXTURE0);
    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, texture.tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};
