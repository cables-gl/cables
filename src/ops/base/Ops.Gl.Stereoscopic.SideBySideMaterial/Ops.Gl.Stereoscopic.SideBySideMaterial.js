CABLES.Op.apply(this, arguments);
this.name='SideBySide 3d Material';

var cgl=this.patch.cgl;
var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

var texture0=this.addInPort(new Port(this,"texture left",OP_PORT_TYPE_TEXTURE,{preview:true}));
var texture0Uniform=null;

var texture1=this.addInPort(new Port(this,"texture right",OP_PORT_TYPE_TEXTURE,{preview:true}));
var texture1Uniform=null;

var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'#ifdef HAS_TEXTURES'
    .endl()+'   varying vec2 texCoord;'
    .endl()+'   uniform sampler2D tex0;'
    .endl()+'   uniform sampler2D tex1;'
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
this.onLoaded=shader.compile;
shader.setSource(shader.getDefaultVertexShader(),srcFrag);

texture0.onValueChanged=texture1.onValueChanged=function()
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
    cgl.setShader(shader);

    if(texture0.get())
    {
        cgl.gl.activeTexture(cgl.gl.TEXTURE0);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, texture0.get().tex);
    }

    if(texture1.get())
    {
        cgl.gl.activeTexture(cgl.gl.TEXTURE1);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, texture1.get().tex);
    }

    trigger.trigger();

    cgl.setPreviousShader();
};
