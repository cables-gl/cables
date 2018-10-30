var render=op.inTrigger("render");
var next=op.outTrigger("next");
var cgl=op.patch.cgl;

function doRender()
{
    cgl.setShader(shader);
    next.trigger();
    cgl.setPreviousShader();
}

var srcFrag=''
    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   gl_FragColor=vec4(0.0,1.0,0.0,1.0);'
    .endl()+'   if(!gl_FrontFacing)outColor= vec4(1.0,0.0,0.0,1.0);'
    .endl()+'}';


var shader=new CGL.Shader(cgl,'showtexcoords material');

shader.setSource(shader.getDefaultVertexShader(),srcFrag);

render.onTriggered=doRender;
