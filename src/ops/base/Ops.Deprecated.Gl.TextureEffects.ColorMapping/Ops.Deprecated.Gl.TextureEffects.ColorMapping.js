
op.name='ColorLookup';

var render=op.inTrigger('render');
var image=op.addInPort(new CABLES.Port(op,"image",CABLES.OP_PORT_TYPE_TEXTURE));
var trigger=op.outTrigger('trigger');

var axis=op.inValueSelect("Axis",['hotizontal','vertical'],'horizontal');
var pos=op.inValueSlider("Position");

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);

axis.onChange=updateAxis;
updateAxis();

function updateAxis()
{
    shader.removeDefine('VERT');
    shader.removeDefine('HORI');
    if(axis.get()=='vertical')shader.define('VERT');
    else shader.define('HORI');
}

var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'IN vec2 texCoord;'
    .endl()+'UNI sampler2D tex;'
    .endl()+'UNI sampler2D image;'
    .endl()+'UNI float pos;'
    .endl()+''
    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec4 colOrig=texture2D(tex,texCoord);'

    .endl()+'   float gray = dot(vec3(0.2126,0.7152,0.0722), colOrig.rgb );'

    .endl()+'   #ifdef VERT'
    .endl()+'       gl_FragColor.r = texture2D(image,vec2(0.5,colOrig.r)).r;'
    .endl()+'       gl_FragColor.g = texture2D(image,vec2(0.5,colOrig.g)).g;'
    .endl()+'       gl_FragColor.b = texture2D(image,vec2(0.5,colOrig.b)).b;'
    .endl()+'   #endif'

    .endl()+'   #ifdef HORI'
    .endl()+'       gl_FragColor.r = texture2D(image,vec2(colOrig.r,0.5)).r;'
    .endl()+'       gl_FragColor.g = texture2D(image,vec2(colOrig.g,0.5)).g;'
    .endl()+'       gl_FragColor.b = texture2D(image,vec2(colOrig.b,0.5)).b;'
    .endl()+'   #endif'
    
    .endl()+'   gl_FragColor.a = 1.0;'
    
    .endl()+'}';

shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var textureDisplaceUniform=new CGL.Uniform(shader,'t','image',1);
var posUni=new CGL.Uniform(shader,'f','pos',pos);


render.onTriggered=function()
{
    if(!cgl.currentTextureEffect)return;

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0,cgl.currentTextureEffect.getCurrentSourceTexture().tex);
    

    if(image.get() && image.get().tex)
    {
        cgl.setTexture(1,image.get().tex);
        // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, image.get().tex );
    }

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};
