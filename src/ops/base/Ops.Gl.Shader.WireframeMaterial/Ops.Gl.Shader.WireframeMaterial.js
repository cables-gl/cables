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
    .endl()+'uniform mat4 mvMatrix;'
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
    .endl()+'    gl_Position = projMatrix * mvMatrix * pos;'
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
    .endl()+'   #ifdef WIREFRAME_FILL'
    .endl()+'       float v=opacity*(1.0-edgeFactor())*0.95;'
    .endl()+'       gl_FragColor = vec4(v,v,v,opacity);'
    .endl()+'#endif'
    .endl()+''
    .endl()+'#ifndef WIREFRAME_FILL'
    .endl()+'       gl_FragColor = vec4(1.0, 1.0, 1.0, opacity*(1.0-edgeFactor())*0.95);'
    .endl()+'#endif'
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

this.onLoaded=shader.compile;

render.onTriggered=doRender;

doRender();
