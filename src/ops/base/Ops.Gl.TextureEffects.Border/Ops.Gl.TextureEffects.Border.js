const render=op.inTrigger('render');
const trigger=op.outTrigger('trigger');
const smooth=op.inValueBool("Smooth",false);

const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl);
shader.setSource(shader.getDefaultVertexShader(),attachments.border_frag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var aspectUniform=new CGL.Uniform(shader,'f','aspect',0);
var uniSmooth=new CGL.Uniform(shader,'b','smoothed',smooth);

{
    var width=op.addInPort(new CABLES.Port(op,"width",CABLES.OP_PORT_TYPE_VALUE,{display:'range'}));
    width.set(0.1);
    var uniWidth=new CGL.Uniform(shader,'f','width',width.get());

    width.onValueChange(function()
    {
        uniWidth.setValue(width.get()/2 );
    });
}

{
    var r=op.addInPort(new CABLES.Port(op,"diffuse r",CABLES.OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true' }));
    r.onChange=function()
    {
        if(!r.uniform) r.uniform=new CGL.Uniform(shader,'f','r',r.get());
            else r.uniform.setValue(r.get());
    };

    var g=op.addInPort(new CABLES.Port(op,"diffuse g",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));
    g.onChange=function()
    {
        if(!g.uniform) g.uniform=new CGL.Uniform(shader,'f','g',g.get());
            else g.uniform.setValue(g.get());
    };

    var b=op.addInPort(new CABLES.Port(op,"diffuse b",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));
    b.onChange=function()
    {
        if(!b.uniform) b.uniform=new CGL.Uniform(shader,'f','b',b.get());
            else b.uniform.setValue(b.get());
    };

    r.set(Math.random());
    g.set(Math.random());
    b.set(Math.random());
}

render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    var texture=cgl.currentTextureEffect.getCurrentSourceTexture();
    aspectUniform.set(texture.height/texture.width);

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, texture.tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};
