this.name="MinimalMaterial";
var cgl=this.patch.cgl;

var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION) );
var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

var srcVert=''
    .endl()+'{{MODULES_HEAD}}'

    .endl()+'attribute vec3 vPosition;'
    .endl()+'uniform mat4 projMatrix;'
    .endl()+'uniform mat4 mvMatrix;'

    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec4 pos=vec4(vPosition,  1.0);'
    .endl()+'   {{MODULE_VERTEX_POSITION}}'
    .endl()+'   gl_Position = projMatrix * mvMatrix * pos;'
    .endl()+'}';

var srcFrag=''
    .endl()+'{{MODULE_BEGIN_FRAG}}'

    .endl()+'precision highp float;'
    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec4 col=vec4(1.0,1.0,0.0,1.0);'
    .endl()+'   {{MODULE_COLOR}}'
    .endl()+'   gl_FragColor = col;'
    .endl()+'}';
    
var doRender=function()
{
    cgl.setShader(shader);
    trigger.trigger();
    cgl.setPreviousShader();
};

var shader=new CGL.Shader(cgl,'MinimalMaterial');
shader.setModules(['MODULE_VERTEX_POSITION','MODULE_COLOR','MODULE_BEGIN_FRAG']);

shader.setSource(srcVert,srcFrag);
this.onLoaded=shader.compile;

render.onTriggered=doRender;

doRender();