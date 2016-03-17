this.name="Particle Simulation";
var cgl=this.patch.cgl;

var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
var width=this.addInPort(new Port(this,"texture width"));
var height=this.addInPort(new Port(this,"texture height"));

var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));
var tex=this.addOutPort(new Port(this,"texture",OP_PORT_TYPE_TEXTURE,{preview:true}));



var texture=new CGL.Texture(cgl,{isFloatingPointTexture:true});
   texture.setSize(128,128);
   
var shader=new CGL.Shader(cgl);
this.onLoaded=shader.compile;

var srcFrag=''
    .endl()+'precision highp float;'

    .endl()+'float random(vec2 co)'
    .endl()+'{'
    .endl()+'   return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);'
    .endl()+'}'

    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   float c=30.0*random((0.232323)*gl_FragCoord.xy);'
    .endl()+'   gl_FragColor = vec4(c,c,c,1.0);'
    .endl()+'}';


shader.setSource(shader.getDefaultVertexShader(),srcFrag);
tex.set(texture);

var effect=new CGL.TextureEffect(cgl,{fp:true});

function doRender()
{
    effect.setSourceTexture(texture);

    cgl.setShader(shader);
    effect.bind();

    effect.finish();
    cgl.setPreviousShader();

    cgl.resetViewPort();
}

function preview()
{
    doRender();
    tex.val.preview();
}

tex.onPreviewChanged=function()
{
    if(tex.showPreview) render.onTriggered=preview;
    else render.onTriggered=doRender;
};

render.onTriggered=doRender;


