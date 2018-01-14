var render=op.inFunction("render");
var radius=op.inValueSlider("radius",0.25);
var r=op.inValueSlider("r");
var g=op.inValueSlider("g");
var b=op.inValueSlider("b");
var next=op.outFunction("next");

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);
shader.setSource(shader.getDefaultVertexShader(),attachments.roundcorners_frag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
radius.uniform=new CGL.Uniform(shader,'f','radius',radius);
r.uniform=new CGL.Uniform(shader,'f','r',r);
g.uniform=new CGL.Uniform(shader,'f','g',g);
b.uniform=new CGL.Uniform(shader,'f','b',b);

var uniWidth=new CGL.Uniform(shader,'f','width',512);
var uniHeight=new CGL.Uniform(shader,'f','height',512);

render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    uniWidth.setValue(cgl.currentTextureEffect.getCurrentSourceTexture().width);
    uniHeight.setValue(cgl.currentTextureEffect.getCurrentSourceTexture().height);
    
    var texture=cgl.currentTextureEffect.getCurrentSourceTexture();

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.gl.activeTexture(cgl.gl.TEXTURE0);
    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, texture.tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};
