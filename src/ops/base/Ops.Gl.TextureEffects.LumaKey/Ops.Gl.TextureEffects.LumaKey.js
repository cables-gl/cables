op.name="LumaKey";
var cgl=op.patch.cgl;

var render=op.addInPort(new Port(op,"render",CABLES.OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));

var inInvert=op.inValueBool("Invert");
var inBlackWhite=op.inValueBool("Black White");



var threshold=op.addInPort(new Port(op,"amthresholdount",CABLES.OP_PORT_TYPE_VALUE,{display:'range'}));
threshold.set(0.5);

var shader=new CGL.Shader(cgl);
//op.onLoaded=shader.compile;

var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'IN vec2 texCoord;'
    .endl()+'uniform sampler2D tex;'
    .endl()+'uniform float threshhold;'

    .endl()+'uniform sampler2D text;'

    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec4 col = texture2D(text, texCoord );'

    .endl()+'   float gray = dot(vec3(0.2126,0.7152,0.0722), col.rgb );'

    .endl()+'   #ifndef INVERT'
    .endl()+'       if(gray < threshhold) col.r=col.g=col.b=col.a=0.0;'
    .endl()+'   #ifdef BLACKWHITE'
    .endl()+'       else col.r=col.g=col.b=col.a=1.0;'
    .endl()+'   #endif'

    .endl()+'   #endif'
    .endl()+'   #ifdef INVERT'
    .endl()+'       if(gray > threshhold) col.r=col.g=col.b=col.a=0.0;'
    .endl()+'   #ifdef BLACKWHITE'
    .endl()+'       else col.r=col.g=col.b=col.a=1.0;'
    .endl()+'   #endif'
    .endl()+'   #endif'

    .endl()+'   gl_FragColor = col;'
    .endl()+'}';


shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);

var unThreshold=new CGL.Uniform(shader,'f','threshhold',threshold);

inBlackWhite.onChange=function()
{
    if(inInvert.get()) shader.define('BLACKWHITE');
        else shader.removeDefine('BLACKWHITE');
};

inInvert.onChange=function()
{
    if(inInvert.get()) shader.define('INVERT');
        else shader.removeDefine('INVERT');
};


render.onTriggered=function()
{
    if(!cgl.currentTextureEffect)return;


// unThreshold.setValue( threshold.get() );


    cgl.setShader(shader);


    cgl.currentTextureEffect.bind();
    /* --- */cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );
    // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();

    cgl.setPreviousShader();
    trigger.trigger();
};
