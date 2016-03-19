var cgl=this.patch.cgl;

this.name='ShowTexCoordsMaterial';
var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

var doRender=function()
{
    cgl.setShader(shader);
    trigger.trigger();
    cgl.setPreviousShader();
};

var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'varying vec2 texCoord;'
    .endl()+''
    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec4 col=vec4(texCoord.x,texCoord.y,1.0,1.0);'
    .endl()+'   gl_FragColor = col;'
    .endl()+'}';


var shader=new CGL.Shader(cgl,'showtexcoords material');
this.onLoaded=shader.compile;

shader.setSource(shader.getDefaultVertexShader(),srcFrag);

render.onTriggered=doRender;
doRender();

