var render=op.inTrigger('render');
var trigger=op.outTrigger('trigger');
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
    .endl()+'   outColor= col;'
    .endl()+'}';

var shader=new CGL.Shader(cgl,'showtexcoords material');

shader.setSource(shader.getDefaultVertexShader(),srcFrag);

render.onTriggered=doRender;
doRender();
