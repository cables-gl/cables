
var cgl=op.patch.cgl;
var render=op.inTrigger('render');
var trigger=op.outTrigger('trigger');

var texture0=op.addInPort(new CABLES.Port(op,"texture left",CABLES.OP_PORT_TYPE_TEXTURE,{preview:true}));
var texture0Uniform=null;

var texture1=op.addInPort(new CABLES.Port(op,"texture right",CABLES.OP_PORT_TYPE_TEXTURE,{preview:true}));
var texture1Uniform=null;

var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'#ifdef HAS_TEXTURES'
    .endl()+'   IN vec2 texCoord;'
    .endl()+'   UNI sampler2D tex0;'
    .endl()+'   UNI sampler2D tex1;'
    .endl()+'#endif'

    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec4 col=vec4(1,1,1,1.0);'
    .endl()+'   #ifdef HAS_TEXTURES'

    .endl()+'   if(mod(gl_FragCoord.y,2.0)>=1.0)col=texture2D(tex0,texCoord);'
    .endl()+'       else col=texture2D(tex1,texCoord);'

    .endl()+'   #endif'
    .endl()+'gl_FragColor = col;'
    .endl()+'}';

var shader=new CGL.Shader(cgl);

shader.setSource(shader.getDefaultVertexShader(),srcFrag);

texture0.onChange=texture1.onChange=function()
{
    if(texture0.get() && texture1.get())
    {
        shader.removeUniform('tex');
        shader.define('HAS_TEXTURES');
        texture0Uniform=new CGL.Uniform(shader,'t','tex0',0);
        texture1Uniform=new CGL.Uniform(shader,'t','tex1',1);
    }
    else
    {
        shader.removeUniform('tex');
        shader.removeDefine('HAS_TEXTURES');
        texture0Uniform=null;
        texture1Uniform=null;
    }
};

render.onTriggered=function()
{
    cgl.pushShader(shader);

    if(texture0.get())cgl.setTexture(0,texture0.get().tex);
    if(texture1.get())cgl.setTexture(1,texture1.get().tex);

    trigger.trigger();

    cgl.popShader();
};
