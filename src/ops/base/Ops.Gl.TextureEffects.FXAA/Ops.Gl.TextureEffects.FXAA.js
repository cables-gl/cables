// shader from: https://github.com/mattdesl/glsl-fxaa

op.name='FXAA';
var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var fxaa_span=op.addInPort(new Port(op,"span",OP_PORT_TYPE_VALUE,{display:'dropdown',values:[0,2,4,8,16,32,64]}));
var fxaa_reduceMin=op.addInPort(new Port(op,"reduceMin",OP_PORT_TYPE_VALUE));
var fxaa_reduceMul=op.addInPort(new Port(op,"reduceMul",OP_PORT_TYPE_VALUE));

var useVPSize=op.inValueBool("use viewport size",true);

var texWidth=op.addInPort(new Port(op,"width",OP_PORT_TYPE_VALUE));
var texHeight=op.addInPort(new Port(op,"height",OP_PORT_TYPE_VALUE));

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);
//op.onLoaded=shader.compile;

var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'#ifdef HAS_TEXTURES'
    .endl()+'  IN vec2 texCoord;'
    .endl()+'  uniform sampler2D tex;'
    .endl()+'#endif'
    .endl()+'    uniform float FXAA_SPAN_MAX;'

    .endl()+'    uniform float FXAA_REDUCE_MUL;'
    .endl()+'    uniform float FXAA_REDUCE_MIN;'
    .endl()+'    uniform float width;'
    .endl()+'    uniform float height;'

    .endl()+'vec4 getColorFXAA(vec2 coord)'
    .endl()+'{'
    .endl()+'    vec2 invtexsize=vec2(1.0/width,1.0/height);'
    .endl()+''
    .endl()+'    float step=1.0;'
    .endl()+''
    .endl()+'    vec3 rgbNW = texture2D(tex, coord.xy + (vec2(-step, -step)*invtexsize )).xyz;'
    .endl()+'    vec3 rgbNE = texture2D(tex, coord.xy + (vec2(+step, -step)*invtexsize )).xyz;'
    .endl()+'    vec3 rgbSW = texture2D(tex, coord.xy + (vec2(-step, +step)*invtexsize )).xyz;'
    .endl()+'    vec3 rgbSE = texture2D(tex, coord.xy + (vec2(+step, +step)*invtexsize )).xyz;'
    .endl()+'    vec3 rgbM  = texture2D(tex, coord.xy).xyz;'
    .endl()+''
    .endl()+'    vec3 luma = vec3(0.299, 0.587, 0.114);'
    .endl()+'    float lumaNW = dot(rgbNW, luma);'
    .endl()+'    float lumaNE = dot(rgbNE, luma);'
    .endl()+'    float lumaSW = dot(rgbSW, luma);'
    .endl()+'    float lumaSE = dot(rgbSE, luma);'
    .endl()+'    float lumaM  = dot( rgbM, luma);'
    .endl()+''
    .endl()+'    float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));'
    .endl()+'    float lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));'
    .endl()+''
    .endl()+'    vec2 dir;'
    .endl()+'    dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));'
    .endl()+'    dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));'
    .endl()+''
    .endl()+'    float dirReduce = max((lumaNW + lumaNE + lumaSW + lumaSE) * (0.25 * FXAA_REDUCE_MUL), FXAA_REDUCE_MIN);'
    .endl()+''
    .endl()+'    float rcpDirMin = 1.0/(min(abs(dir.x), abs(dir.y)) + dirReduce);'
    .endl()+''
    .endl()+'    dir = min(vec2(FXAA_SPAN_MAX,  FXAA_SPAN_MAX),'
    .endl()+'          max(vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX), dir * rcpDirMin))*invtexsize ;'
    .endl()+''
    .endl()+'    vec3 rgbA = (1.0/2.0) * ('
    .endl()+'                texture2D(tex, coord.xy + dir * (1.0/3.0 - 0.5)).xyz +'
    .endl()+'                texture2D(tex, coord.xy + dir * (2.0/3.0 - 0.5)).xyz);'
    .endl()+'    vec3 rgbB = rgbA * (1.0/2.0) + (1.0/4.0) * ('
    .endl()+'                texture2D(tex, coord.xy + dir * (0.0/3.0 - 0.5)).xyz +'
    .endl()+'                texture2D(tex, coord.xy + dir * (3.0/3.0 - 0.5)).xyz);'
    .endl()+'    float lumaB = dot(rgbB, luma);'
    .endl()+''
    .endl()+'    vec4 color=texture2D(tex,coord).rgba;'
    .endl()+''
    .endl()+'    if((lumaB < lumaMin) || (lumaB > lumaMax)){'
    .endl()+'      color.xyz=rgbA;'
    .endl()+'    } else {'
    .endl()+'      color.xyz=rgbB;'
    .endl()+'    }'
    .endl()+'    return color;'
    .endl()+'}'
    .endl()+''
    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec4 col=vec4(1.0,0.0,0.0,1.0);'
    .endl()+'   gl_FragColor = getColorFXAA(texCoord);'
    .endl()+'}';

shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);

render.onTriggered=function()
{
    if(!cgl.currentTextureEffect)return;
    cgl.setShader(shader);

    if(cgl.getViewPort()[2]!=texWidth.get() || cgl.getViewPort()[3]!=texHeight.get())
    {
        changeRes();
    }

    cgl.currentTextureEffect.bind();
    /* --- */cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );
    // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();

    cgl.setPreviousShader();

    trigger.trigger();
};


var uniformSpan=new CGL.Uniform(shader,'f','FXAA_SPAN_MAX',0);
var uniformMul=new CGL.Uniform(shader,'f','FXAA_REDUCE_MUL',0);
var uniformMin=new CGL.Uniform(shader,'f','FXAA_REDUCE_MIN',0);

fxaa_span.onValueChanged=function()
{
    uniformSpan.setValue(parseInt(fxaa_span.get(),10));
};

var uWidth=new CGL.Uniform(shader,'f','width',0);
var uHeight=new CGL.Uniform(shader,'f','height',0);

function changeRes()
{
    if(useVPSize.get())
    {
        var w=cgl.getViewPort()[2];
        var h=cgl.getViewPort()[3];
        uWidth.setValue(w);
        uHeight.setValue(h);
        // texWidth.set(w);
        // texHeight.set(h);
    }
    else
    {
        uWidth.setValue(texWidth.get());
        uHeight.setValue(texHeight.get());
    }
}

texWidth.onValueChanged=changeRes;
texHeight.onValueChanged=changeRes;
useVPSize.onValueChanged=changeRes;
op.onResize=changeRes;

fxaa_span.set(8);
// texWidth.set(1920);
// texHeight.set(1080);

fxaa_reduceMul.onValueChanged=function()
{
    uniformMul.setValue(1.0/fxaa_reduceMul.get());
};

fxaa_reduceMin.onValueChanged=function()
{
    uniformMin.setValue(1.0/fxaa_reduceMin.get());
};

fxaa_reduceMul.set(8);
fxaa_reduceMin.set(128);
