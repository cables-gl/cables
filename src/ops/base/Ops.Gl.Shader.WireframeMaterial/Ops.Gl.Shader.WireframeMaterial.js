this.name="Wireframe Material";
var cgl=this.patch.cgl;

var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION) );
var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

var enableDepth=this.addInPort(new Port(this,"enable depth testing",OP_PORT_TYPE_VALUE,{ display:'bool' }));
enableDepth.set(true);

var fill=this.addInPort(new Port(this,"fill",OP_PORT_TYPE_VALUE,{ display:'bool' }));
fill.set(false);
fill.onValueChanged=function()
{
    if(fill.get()) shader.define('WIREFRAME_FILL');
        else shader.removeDefine('WIREFRAME_FILL');
};

var w=this.addInPort(new Port(this,"width",OP_PORT_TYPE_VALUE,{ display:'range' }));
w.set(0.25);
w.onValueChanged=function(){ uniformWidth.setValue(w.get()); };

var opacity=this.addInPort(new Port(this,"opacity",OP_PORT_TYPE_VALUE,{ display:'range' }));
opacity.set(1.0);
opacity.onValueChanged=function(){ uniformOpacity.setValue(opacity.get()); };

if(!cgl.gl.getExtension('OES_standard_derivatives') ) console.error('no oes standart dericatives');

var srcVert=''
    .endl()+'{{MODULES_HEAD}}'
    .endl()+'attribute vec3 vPosition;'
    .endl()+'attribute vec3 attrBaycentric;'
    .endl()+'uniform mat4 projMatrix;'
    .endl()+'uniform mat4 modelMatrix;'
    .endl()+'uniform mat4 viewMatrix;'
    .endl()+'varying vec3 baycentric;'
    .endl()+'attribute vec2 attrTexCoord;'
    .endl()+'varying vec2 texCoord;'
    .endl()+''
    .endl()+'void main()'
    .endl()+'{'
    .endl()+'    texCoord=attrTexCoord;'
    .endl()+'    baycentric=attrBaycentric;'
    .endl()+'    vec4 pos = vec4( vPosition, 1. );'
    .endl()+'    {{MODULE_VERTEX_POSITION}}'
    .endl()+'    gl_Position = projMatrix * viewMatrix * modelMatrix * pos;'
    .endl()+'}';

    var srcFrag=''
    .endl()+'#extension GL_OES_standard_derivatives : enable'
    .endl()+'precision highp float;'
    .endl()+'varying vec3 baycentric;'
    .endl()+'uniform float width;'
    .endl()+'uniform float opacity;'
    .endl()+'uniform float r,g,b;'
    .endl()+''
    .endl()+'float edgeFactor()'
    .endl()+'{'
    .endl()+'    vec3 d = fwidth(baycentric);'
    .endl()+'    vec3 a3 = smoothstep(vec3(0.0), d*width*4.0, baycentric);'
    .endl()+'    return min(min(a3.x, a3.y), a3.z);'
    .endl()+'}'
    .endl()+'void main()'
    .endl()+'{'
    .endl()+'vec4 col;'
    
    .endl()+'   #ifdef WIREFRAME_FILL'
    .endl()+'       float v=opacity*(1.0-edgeFactor())*0.95;'
    .endl()+'       col = vec4(v*r,v*g,v*b,opacity);'
    .endl()+'#endif'
    .endl()+''
    .endl()+'#ifndef WIREFRAME_FILL'
    .endl()+'       col = vec4(r,g,b, opacity*(1.0-edgeFactor())*0.95);'
    .endl()+'#endif'
    // .endl()+'col.xyz=baycentric;'
    
    
    .endl()+'gl_FragColor =col;'
    
    .endl()+'}';

var doRender=function()
{
    if(true!==enableDepth.get()) cgl.gl.disable(cgl.gl.DEPTH_TEST);
        else cgl.gl.enable(cgl.gl.DEPTH_TEST);

    cgl.setShader(shader);
    trigger.trigger();
    cgl.setPreviousShader();
};

var shader=new CGL.Shader(cgl,'Wireframe Material');
var uniformWidth=new CGL.Uniform(shader,'f','width',w.get());
var uniformOpacity=new CGL.Uniform(shader,'f','opacity',opacity.get());
shader.setSource(srcVert,srcFrag);
shader.setModules(['MODULE_VERTEX_POSITION','MODULE_COLOR','MODULE_BEGIN_FRAG']);
shader.wireframe=true;


{
    // diffuse color

    var r=this.addInPort(new Port(this,"diffuse r",OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true' }));
    r.onValueChanged=function()
    {
        if(!r.uniform) r.uniform=new CGL.Uniform(shader,'f','r',r.get());
        else r.uniform.setValue(r.get());
    };

    var g=this.addInPort(new Port(this,"diffuse g",OP_PORT_TYPE_VALUE,{ display:'range' }));
    g.onValueChanged=function()
    {
        if(!g.uniform) g.uniform=new CGL.Uniform(shader,'f','g',g.get());
        else g.uniform.setValue(g.get());
    };

    var b=this.addInPort(new Port(this,"diffuse b",OP_PORT_TYPE_VALUE,{ display:'range' }));
    b.onValueChanged=function()
    {
        if(!b.uniform) b.uniform=new CGL.Uniform(shader,'f','b',b.get());
        else b.uniform.setValue(b.get());
    };

    var a=this.addInPort(new Port(this,"diffuse a",OP_PORT_TYPE_VALUE,{ display:'range' }));
    a.onValueChanged=function()
    {
        if(!a.uniform) a.uniform=new CGL.Uniform(shader,'f','a',a.get());
        else a.uniform.setValue(a.get());
    };

    r.set(Math.random());
    g.set(Math.random());
    b.set(Math.random());
    a.set(1.0);
}


this.onLoaded=shader.compile;

render.onTriggered=doRender;

doRender();
