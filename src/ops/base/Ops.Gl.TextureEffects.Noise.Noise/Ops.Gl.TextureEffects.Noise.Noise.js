var render=op.addInPort(new Port(op,"Render",OP_PORT_TYPE_FUNCTION));

var blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal");
var amount=op.inValueSlider("Amount",1);

var trigger=op.addOutPort(new Port(op,"Next",OP_PORT_TYPE_FUNCTION));

var animated=op.inValueBool("Animated",true);

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);

var amountUniform=new CGL.Uniform(shader,'f','amount',amount);
var timeUniform=new CGL.Uniform(shader,'f','time',1.0);

var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'#ifdef HAS_TEXTURES'
    .endl()+'  IN vec2 texCoord;'
    .endl()+'  uniform sampler2D tex;'
    .endl()+'#endif'

    .endl()+'uniform float amount;'
    .endl()+'uniform float time;'

    .endl()+'float random(vec2 co)'
    .endl()+'{'
    .endl()+'   return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 437511.5453);'
    .endl()+'}'

    +CGL.TextureEffect.getBlendCode()

    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   float r=random((time+0.232323)*texCoord.xy);'
    .endl()+'   vec4 rnd=vec4( r,r,r,1.0 );'
    .endl()+'   vec4 base=texture2D(tex,texCoord);'
    
    .endl()+'   vec4 col=vec4( _blend(base.rgb,rnd.rgb) ,1.0);'
    .endl()+'   col=vec4( mix( col.rgb, base.rgb ,1.0-base.a*amount),1.0);'

    .endl()+'   gl_FragColor = col;'
    .endl()+'}';


shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);

blendMode.onValueChanged=function()
{
    CGL.TextureEffect.onChangeBlendSelect(shader,blendMode.get());
};

render.onTriggered=function()
{
    if(!cgl.currentTextureEffect)return;

    if(animated.get()) timeUniform.setValue(op.patch.freeTimer.get()/1000%100);
        else timeUniform.setValue(0);

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.gl.activeTexture(cgl.gl.TEXTURE0);
    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};

