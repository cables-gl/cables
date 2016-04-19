
op.name='ShowNormalsMaterial';
var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var cgl=op.patch.cgl;

function doRender()
{
    cgl.setShader(shader);
    trigger.trigger();
    cgl.setPreviousShader();
}

var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'varying vec3 norm;'
    .endl()+''
    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec4 col=vec4(norm.x,norm.y,norm.z,1.0);'
    .endl()+'   gl_FragColor = col;'
    .endl()+'}';


var shader=new CGL.Shader(cgl);
op.onLoaded=shader.compile;

shader.setSource(shader.getDefaultVertexShader(),srcFrag);

render.onTriggered=doRender;
doRender();