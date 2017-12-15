var cgl=op.patch.cgl;

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION) );
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));
var opacity=op.addInPort(new Port(op,"opacity",OP_PORT_TYPE_VALUE,{display:'range'}));
opacity.set(1);

var srcVert=''
    .endl()+'{{MODULES_HEAD}}'

    .endl()+'IN vec3 vPosition;'
    .endl()+'IN vec3 attrVertColor;'
    .endl()+'UNI mat4 projMatrix;'
    .endl()+'UNI mat4 mvMatrix;'
    .endl()+'OUT vec4 color;'

    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   color.rgb=attrVertColor;'
    .endl()+'    vec4 pos = vec4( vPosition, 1. );'

    .endl()+'{{MODULE_VERTEX_POSITION}}'

    .endl()+'   gl_Position = projMatrix * mvMatrix * pos;'
    .endl()+'}';

    var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'{{MODULES_HEAD}}'

    .endl()+'IN vec4 color;'
    .endl()+'UNI float opacity;'

    .endl()+'void main()'
    .endl()+'{'
    .endl()+'{{MODULE_BEGIN_FRAG}}'
    .endl()+'   vec4 col=color;'
    .endl()+'{{MODULE_COLOR}}'

    .endl()+'   col.a=opacity;'
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
op.onLoaded=shader.compile;

render.onTriggered=doRender;

doRender();
