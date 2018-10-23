
var render=op.addInPort(new Port(op,"render",CABLES.OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));
var cgl=op.patch.cgl;

function doRender()
{
    cgl.setShader(shader);
    trigger.trigger();
    cgl.setPreviousShader();
}

var srcFrag=''
    .endl()+'IN vec2 texCoord;'
    .endl()+''
    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec4 col=vec4(texCoord.x,texCoord.y,1.0,1.0);'
    // .endl()+' if(texCoord.y==0.0)col.r=1.0;'
    
    .endl()+'   gl_FragColor = col;'
    .endl()+'}';


var shader=new CGL.Shader(cgl,'showtexcoords material');

shader.setSource(shader.getDefaultVertexShader(),srcFrag);

render.onTriggered=doRender;
doRender();
