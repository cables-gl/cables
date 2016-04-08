this.name="vertex color material";
var cgl=this.patch.cgl;

var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION) );
var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));
var opacity=this.addInPort(new Port(this,"opacity",OP_PORT_TYPE_VALUE,{display:'range'}));
opacity.set(1);
var srcVert=''
    .endl()+'{{MODULES_HEAD}}'

    .endl()+'attribute vec3 vPosition;'
    .endl()+'attribute vec4 attrVertColor;'
    .endl()+'uniform mat4 projMatrix;'
    .endl()+'uniform mat4 mvMatrix;'
    .endl()+'varying vec4 color;'

    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   color=attrVertColor;'
    .endl()+'    vec4 pos = vec4( vPosition, 1. );'

    .endl()+'{{MODULE_VERTEX_POSITION}}'

    .endl()+'   gl_Position = projMatrix * mvMatrix * pos;'
    .endl()+'}';

    var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'{{MODULES_HEAD}}'

    .endl()+'varying vec4 color;'
    .endl()+'uniform float opacity;'
    .endl()+'void main()'
    .endl()+'{'
    .endl()+'{{MODULE_BEGIN_FRAG}}'
    .endl()+'   vec4 col=color;'
    .endl()+'{{MODULE_COLOR}}'

    .endl()+'   col.a*=opacity;'
    .endl()+'   gl_FragColor = col;'
    .endl()+'}';
    
var doRender=function()
{
    cgl.gl.blendFunc(cgl.gl.SRC_ALPHA,cgl.gl.ONE_MINUS_SRC_ALPHA);
    cgl.setShader(shader);
    trigger.trigger();
    cgl.setPreviousShader();
};

opacity.onValueChanged=function()
{
    uniOpacity.setValue(opacity.get());
};


var shader=new CGL.Shader(cgl,'vertex color material');
shader.setModules(['MODULE_VERTEX_POSITION','MODULE_COLOR','MODULE_BEGIN_FRAG']);
uniOpacity=new CGL.Uniform(shader,'f','opacity',opacity.get());

shader.setSource(srcVert,srcFrag);
this.onLoaded=shader.compile;

render.onTriggered=doRender;

doRender();