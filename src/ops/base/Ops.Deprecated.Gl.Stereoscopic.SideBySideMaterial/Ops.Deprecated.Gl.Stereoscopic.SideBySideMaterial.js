var render=op.inTrigger('render');
var trigger=op.outTrigger('trigger');

var texture0=op.addInPort(new CABLES.Port(op,"texture left",CABLES.OP_PORT_TYPE_TEXTURE,{preview:true}));
var texture0Uniform=null;

var texture1=op.addInPort(new CABLES.Port(op,"texture right",CABLES.OP_PORT_TYPE_TEXTURE,{preview:true}));
var texture1Uniform=null;

var cgl=op.patch.cgl;

var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'#ifdef HAS_TEXTURES'
    .endl()+'   IN vec2 texCoord;'
    .endl()+'   UNI sampler2D tex0;'
    .endl()+'   UNI sampler2D tex1;'
    .endl()+'#endif'

    .endl()+'vec2 HmdWarp(vec2 in01)'
    .endl()+'{'

    .endl()+'   vec2 LensCentre=vec2(0.5,0.5);'
    .endl()+'   vec2 Scale=vec2(0.3,0.3);'
    .endl()+'   vec2 ScaleIn=vec2(2.0,2.0);'
    .endl()+'   vec4 HmdWarpParam=vec4(1.0, 0.22, 0.24, 0.0);'

    .endl()+'	vec2 theta = (in01 - LensCentre) * ScaleIn; // Scales to [-1, 1]'
    .endl()+'	float rSq = theta.x * theta.x + theta.y * theta.y;'
    .endl()+'	vec2 rvector = theta * (HmdWarpParam.x + HmdWarpParam.y * rSq + HmdWarpParam.z * rSq * rSq + HmdWarpParam.w * rSq * rSq * rSq);'
    .endl()+'	return LensCentre + Scale * rvector;'
    .endl()+'}'

    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec4 col=vec4(1,1,1,1.0);'
    .endl()+'   #ifdef HAS_TEXTURES'
    //  .endl()+'   if(texCoord.x>=0.5)col=texture2D(tex0,HmdWarp(vec2( (texCoord.x-0.5)*2.0,texCoord.y)));'
    //  .endl()+'       else col=texture2D(tex1,HmdWarp(vec2( (texCoord.x)*2.0 ,texCoord.y)));'
    .endl()+'   if(texCoord.x>=0.5)col=texture2D(tex0,vec2( (texCoord.x-0.5)*2.0,texCoord.y));'
    .endl()+'       else col=texture2D(tex1,vec2( (texCoord.x)*2.0 ,texCoord.y));'

    .endl()+'   if(texCoord.x>=0.495 && texCoord.x<=0.505)col=vec4(1.0,0.0,0.0,1.0);'

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

    if(texture0.get())
    {
        cgl.setTexture(0, texture0.get().tex);
        // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, texture0.get().tex);
    }

    if(texture1.get())
    {
        cgl.setTexture(1, texture1.get().tex);
        // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, texture1.get().tex);
    }

    trigger.trigger();

    cgl.popShader();
};
