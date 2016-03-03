this.name="vertex color material";
var cgl=this.patch.cgl;

var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION) );
var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

var srcVert=''
    .endl()+'attribute vec3 vPosition;'
    .endl()+'attribute vec4 attrVertColor;'
    .endl()+'uniform mat4 projMatrix;'
    .endl()+'uniform mat4 mvMatrix;'
    .endl()+'varying vec4 col;'

    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   col=attrVertColor;'
    .endl()+'   gl_Position = projMatrix * mvMatrix * vec4(vPosition,  1.0);'
    .endl()+'}';

    var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'varying vec4 col;'
    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   gl_FragColor = col;'
    .endl()+'}';
    
var doRender=function()
{
    cgl.setShader(shader);
    trigger.trigger();
    cgl.setPreviousShader();
};

var shader=new CGL.Shader(cgl,'vertex color material');
shader.setSource(srcVert,srcFrag);
this.onLoaded=shader.compile;

render.onTriggered=doRender;

doRender();