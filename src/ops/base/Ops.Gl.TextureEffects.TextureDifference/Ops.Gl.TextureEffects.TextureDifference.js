var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var texture1=op.inTexture("Texture 1");
var texture2=op.inTexture("Texture 2");

var trigger=op.outFunction("Next");

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);




shader.setSource(shader.getDefaultVertexShader(),attachments.tex_difference_frag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var unitex1=new CGL.Uniform(shader,'t','tex1',1);
var unitex2=new CGL.Uniform(shader,'t','tex2',2);

render.onTriggered=function()
{
    if(!cgl.currentTextureEffect)return;

    if(texture1.get() && texture2.get())
    {

        var texture=cgl.currentTextureEffect.getCurrentSourceTexture();
    
        cgl.setShader(shader);
        cgl.currentTextureEffect.bind();
    
        cgl.gl.activeTexture(cgl.gl.TEXTURE0);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, texture.tex );
    
        cgl.gl.activeTexture(cgl.gl.TEXTURE1);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, texture1.get().tex );

        cgl.gl.activeTexture(cgl.gl.TEXTURE2);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, texture2.get().tex );

        cgl.currentTextureEffect.finish();
        cgl.setPreviousShader();
    }

    trigger.trigger();
};
