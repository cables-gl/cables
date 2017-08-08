var cgl=op.patch.cgl;

op.name='Blur';
var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));
var fast=op.inValueBool("Fast",true);




var amount=op.addInPort(new Port(op,"amount",OP_PORT_TYPE_VALUE));
amount.set(10);

var shader=new CGL.Shader(cgl);
op.onLoaded=shader.compile;

shader.define("FASTBLUR");

fast.onChange=function()
{
    if(fast.get()) shader.define("FASTBLUR");
        else shader.removeDefine("FASTBLUR");

};

var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'  varying vec2 texCoord;'
    .endl()+'  uniform sampler2D tex;'
    .endl()+'  uniform float dirX;'
    .endl()+'  uniform float dirY;'
    .endl()+'  uniform float amount;'

    .endl()+'  #ifdef HAS_MASK'
    .endl()+'    uniform sampler2D imageMask;'
    .endl()+'  #endif'

    .endl()+'uniform sampler2D texture;'



    .endl()+''
    .endl()+'float random(vec3 scale, float seed)'
    .endl()+'{'
    .endl()+'    return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);'
    .endl()+'}'
    .endl()+''
    .endl()+'void main()'
    .endl()+'{'
    .endl()+'    vec4 color = vec4(0.0);'
    .endl()+'    float total = 0.0;'

    .endl()+'   float am=amount;'
    .endl()+'   #ifdef HAS_MASK'
    .endl()+'       am=amount*texture2D(imageMask,texCoord).r;'
    .endl()+'       if(am<=0.02)'
    .endl()+'       {'
    .endl()+'           gl_FragColor=texture2D(texture, texCoord);'
    // .endl()+'           gl_FragColor.r=1.0;'

    .endl()+'           return;'
    .endl()+'       }'
    .endl()+'   #endif'

    .endl()+'   vec2 delta=vec2(dirX*am*0.01,dirY*am*0.01);'


    .endl()+'    '
    // .endl()+'    /* randomize the lookup values to hide the fixed number of samples */'
    .endl()+'    float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);'


    .endl()+'    #ifndef FASTBLUR'
    .endl()+'    const float range=20.0;'
    .endl()+'    #endif'
    .endl()+'    #ifdef FASTBLUR'
    .endl()+'    const float range=5.0;'
    .endl()+'    #endif'

    .endl()+'    for (float t = -range; t <= range; t++) {'
    .endl()+'        float percent = (t + offset - 0.5) / range;'
    .endl()+'        float weight = 1.0 - abs(percent);'
    .endl()+'        vec4 sample = texture2D(texture, texCoord + delta * percent);'
    .endl()+'        '
    // .endl()+'        /* switch to pre-multiplied alpha to correctly blur transparent images */'
    .endl()+'        sample.rgb *= sample.a;'

    .endl()+'        color += sample * weight;'
    .endl()+'        total += weight;'
    .endl()+'    }'

    .endl()+'    gl_FragColor = color / total;'

    // .endl()+'    /* switch back from pre-multiplied alpha */'
    .endl()+'    gl_FragColor.rgb /= gl_FragColor.a + 0.00001;'
    .endl()+'}';


shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var uniDirX=new CGL.Uniform(shader,'f','dirX',0);
var uniDirY=new CGL.Uniform(shader,'f','dirY',0);

var uniWidth=new CGL.Uniform(shader,'f','width',0);
var uniHeight=new CGL.Uniform(shader,'f','height',0);

var uniAmount=new CGL.Uniform(shader,'f','amount',amount.get());
amount.onValueChange(function(){ uniAmount.setValue(amount.get()); });

var textureAlpha=new CGL.Uniform(shader,'t','imageMask',1);


var direction=op.addInPort(new Port(op,"direction",OP_PORT_TYPE_VALUE,{display:'dropdown',values:['both','vertical','horizontal']}));
var dir=0;
direction.set('both');
direction.onValueChange(function()
{
    if(direction.get()=='both')dir=0;
    if(direction.get()=='horizontal')dir=1;
    if(direction.get()=='vertical')dir=2;
});

var mask=op.addInPort(new Port(op,"mask",OP_PORT_TYPE_TEXTURE,{preview:true }));

mask.onValueChanged=function()
{
    if(mask.get() && mask.get().tex) shader.define('HAS_MASK');
        else shader.removeDefine('HAS_MASK');
};



render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.setShader(shader);

    uniWidth.setValue(cgl.currentTextureEffect.getCurrentSourceTexture().width);
    uniHeight.setValue(cgl.currentTextureEffect.getCurrentSourceTexture().height);



    // first pass
    if(dir===0 || dir==2)
    {

        cgl.currentTextureEffect.bind();
        cgl.gl.activeTexture(cgl.gl.TEXTURE0);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

        if(mask.get() && mask.get().tex)
        {
            cgl.gl.activeTexture(cgl.gl.TEXTURE1);
            cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, mask.get().tex );
        }


        uniDirX.setValue(0.0);
        uniDirY.setValue(1.0);

        cgl.currentTextureEffect.finish();
    }

    // second pass
    if(dir===0 || dir==1)
    {

        cgl.currentTextureEffect.bind();
        cgl.gl.activeTexture(cgl.gl.TEXTURE0);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

        if(mask.get() && mask.get().tex)
        {
            cgl.gl.activeTexture(cgl.gl.TEXTURE1);
            cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, mask.get().tex );
        }

        uniDirX.setValue(1.0);
        uniDirY.setValue(0.0);

        cgl.currentTextureEffect.finish();
    }

    cgl.setPreviousShader();
    trigger.trigger();
};
