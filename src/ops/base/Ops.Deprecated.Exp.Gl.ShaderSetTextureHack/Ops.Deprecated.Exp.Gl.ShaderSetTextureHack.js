op.name="ShaderSetTextureHack";

var exec=op.inTrigger("Exec");
var next=op.outTrigger("Next");

var iindex=op.inValueInt("index");
var texture=op.inTexture("texture");


var cgl=op.patch.cgl;

var oldBind=null;

var bindTextures =function()
{
    if(oldBind)oldBind();
    cgl.setTexture(iindex.get(),texture.get().tex);

};

exec.onTriggered=function()
{
    
    oldBind=op.patch.cgl.getShader().bindTextures;
    
    op.patch.cgl.getShader().bindTextures=bindTextures;
    
    next.trigger();
    
    op.patch.cgl.getShader().bindTextures=oldBind;
};