var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var x=op.inValue("X",0);
var y=op.inValue("Y",0);
var z=op.inValue("Z",0);
var scale=op.inValue("Scale",22);
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);
shader.setSource(shader.getDefaultVertexShader(),attachments.cellularnoise3d_frag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);

var uniZ=new CGL.Uniform(shader,'f','z',z);
var uniX=new CGL.Uniform(shader,'f','x',x);
var uniY=new CGL.Uniform(shader,'f','y',y);
var uniScale=new CGL.Uniform(shader,'f','scale',scale);

var tile=op.inValueBool("Tileable",false);
tile.onChange=updateTileable;
function updateTileable()
{
    if(tile.get())shader.define("DO_TILEABLE");
        else shader.removeDefine("DO_TILEABLE");
}

render.onTriggered=function()
{
    if(!cgl.currentTextureEffect)return;

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.gl.activeTexture(cgl.gl.TEXTURE0);
    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};
