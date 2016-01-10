this.name="MinimalMaterial";
var cgl=this.patch.cgl;

var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION) );
var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

var srcVert=''
    .endl()+'attribute vec3 vPosition;'
    .endl()+'uniform mat4 projMatrix;'
    .endl()+'uniform mat4 mvMatrix;'

    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   gl_Position = projMatrix * mvMatrix * vec4(vPosition,  1.0);'
    .endl()+'}';

    var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   gl_FragColor = vec4(1.0,0.0,0.0,1.0);'
    .endl()+'}';
    
var doRender=function()
{
    cgl.setShader(shader);
    trigger.trigger();
    cgl.setPreviousShader();
};

var shader=new CGL.Shader(cgl,'MinimalMaterial');
shader.setSource(srcVert,srcFrag);
this.onLoaded=shader.compile;

render.onTriggered=doRender;

doRender();