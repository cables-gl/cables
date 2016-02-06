this.name="Wireframe Material";
var cgl=this.patch.cgl;

    // put this in setgeom of mesh:
    // {
    //     geom.unIndex();
    //     geom.calcBaycentric();
    //     addAttribute('attrBaycentric',geom.baycentrics,3);
    // }


var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION) );
var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

var enableDepth=this.addInPort(new Port(this,"enable depth testing",OP_PORT_TYPE_VALUE,{ display:'bool' }));
enableDepth.set(false);

var w=this.addInPort(new Port(this,"width",OP_PORT_TYPE_VALUE,{ display:'range' }));

w.onValueChanged=function()
{
    uniformWidth.setValue(w.get());
};


if(!cgl.gl.getExtension('OES_standard_derivatives') ) console.error('no oes standart dericatives');


var srcVert=''
    .endl()+'attribute vec3 vPosition;'
    .endl()+'attribute vec3 attrBaycentric;'
    .endl()+'uniform mat4 projMatrix;'
    .endl()+'uniform mat4 mvMatrix;'
    .endl()+'varying vec3 baycentric;'

    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   baycentric=attrBaycentric;'
    .endl()+'   gl_Position = projMatrix * mvMatrix * vec4(vPosition,  1.0);'
    .endl()+'}';

    var srcFrag=''
    .endl()+'#extension GL_OES_standard_derivatives : enable'
    .endl()+'precision highp float;'
    .endl()+'varying vec3 baycentric;'
    .endl()+'uniform float width;'

    
    .endl()+'float edgeFactor(){'
    .endl()+'    vec3 d = fwidth(baycentric);'
    .endl()+'    vec3 a3 = smoothstep(vec3(0.0), d*width*4.0, baycentric);'
    .endl()+'    return min(min(a3.x, a3.y), a3.z);'
    .endl()+'}'

    
    .endl()+'void main()'
    .endl()+'{'

    .endl()+'   gl_FragColor = vec4(1.0, 1.0, 1.0, (1.0-edgeFactor())*0.95);'

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
shader.setSource(srcVert,srcFrag);
this.onLoaded=shader.compile;

render.onTriggered=doRender;

doRender();