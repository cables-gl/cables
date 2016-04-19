op.name="vertexnumber material";
var cgl=op.patch.cgl;

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION) );
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var srcVert=''
    .endl()+'attribute float attrVertIndex;'
    .endl()+'uniform mat4 projMatrix;'
    .endl()+'uniform mat4 mvMatrix;'
    .endl()+'attribute vec3 vPosition;'
    .endl()+'varying float num;'

    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   num=attrVertIndex;'
    .endl()+'   gl_Position = projMatrix * mvMatrix * vec4(vPosition,  1.0);'
    .endl()+'}';

var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'varying float num;'
    .endl()+'uniform float numVertices;'
    
    .endl()+'void main()'
    .endl()+'{'
    

    .endl()+'   gl_FragColor = vec4(num/numVertices,num/numVertices,num/numVertices,1.0);'
    .endl()+'}';
    
var doRender=function()
{
    cgl.setShader(shader);
    trigger.trigger();
    cgl.setPreviousShader();
};

var shader=new CGL.Shader(cgl,'vertexnumber material');
shader.setSource(srcVert,srcFrag);
op.onLoaded=shader.compile;

render.onTriggered=doRender;

doRender();