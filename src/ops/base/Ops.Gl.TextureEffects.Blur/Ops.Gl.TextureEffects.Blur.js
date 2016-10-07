var cgl=op.patch.cgl;

op.name='Blur';
var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var amount=op.addInPort(new Port(op,"amount",OP_PORT_TYPE_VALUE));
amount.set(10);

var shader=new CGL.Shader(cgl);
op.onLoaded=shader.compile;

var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'  varying vec2 texCoord;'
    .endl()+'  uniform sampler2D tex;'
    .endl()+'  uniform float dirX;'
    .endl()+'  uniform float dirY;'
    .endl()+'  uniform float amount;'

    .endl()+'uniform sampler2D texture;'
    .endl()+'vec2 delta=vec2(dirX*amount*0.01,dirY*amount*0.01);'
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
    .endl()+'    '
    // .endl()+'    /* randomize the lookup values to hide the fixed number of samples */'
    .endl()+'    float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);'
    .endl()+'    '
    .endl()+'    for (float t = -30.0; t <= 30.0; t++) {'
    .endl()+'        float percent = (t + offset - 0.5) / 30.0;'
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

var direction=op.addInPort(new Port(op,"direction",OP_PORT_TYPE_VALUE,{display:'dropdown',values:['both','vertical','horizontal']}));
var dir=0;
direction.set('both');
direction.onValueChange(function()
{
    if(direction.get()=='both')dir=0;
    if(direction.get()=='horizontal')dir=1;
    if(direction.get()=='vertical')dir=2;
});

render.onTriggered=function()
{
    if(!cgl.currentTextureEffect)return;
    cgl.setShader(shader);

    uniWidth.setValue(cgl.currentTextureEffect.getCurrentSourceTexture().width);
    uniHeight.setValue(cgl.currentTextureEffect.getCurrentSourceTexture().height);

    // first pass
    if(dir===0 || dir==2)
    {
        
        cgl.currentTextureEffect.bind();
        cgl.gl.activeTexture(cgl.gl.TEXTURE0);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

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

        uniDirX.setValue(1.0);
        uniDirY.setValue(0.0);

        cgl.currentTextureEffect.finish();
    }

    cgl.setPreviousShader();
    trigger.trigger();
};