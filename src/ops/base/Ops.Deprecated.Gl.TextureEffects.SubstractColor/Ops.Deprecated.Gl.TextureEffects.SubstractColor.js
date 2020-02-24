op.name="SubstractColor";

var render=op.inTrigger('render');
var trigger=op.outTrigger('trigger');

var amount=op.inValueSlider("amount",0.1);

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);


var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'IN vec2 texCoord;'
    .endl()+'uniform sampler2D tex;'
    .endl()+'uniform float amount;'
    .endl()+''
    .endl()+''
    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec4 subCol=vec4(amount,amount,amount,1.0);'
    .endl()+'   vec4 col=texture2D(tex,texCoord);'
    .endl()+'   col-=subCol;'
    .endl()+'   if(col.r<0.0)col.r=0.0;'
    .endl()+'   if(col.g<0.0)col.g=0.0;'
    .endl()+'   if(col.b<0.0)col.b=0.0;'
    .endl()+'   col.a=1.0;'
    .endl()+'   gl_FragColor = col;'
    .endl()+'}';

shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var amountUniform=new CGL.Uniform(shader,'f','amount',amount.get());

amount.onChange=function()
{
    amountUniform.setValue(amount.get());
};

render.onTriggered=function()
{
    if(!cgl.currentTextureEffect)return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0,cgl.currentTextureEffect.getCurrentSourceTexture().tex);
    

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
