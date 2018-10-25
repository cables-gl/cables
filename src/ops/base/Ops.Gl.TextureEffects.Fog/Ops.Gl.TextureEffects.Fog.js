

var render=op.addInPort(new CABLES.Port(op,"render",CABLES.OP_PORT_TYPE_FUNCTION));
var density=op.addInPort(new CABLES.Port(op,"density",CABLES.OP_PORT_TYPE_VALUE));
var image=op.inTexture("depth texture");
var trigger=op.addOutPort(new CABLES.Port(op,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));

var ignoreInf=op.addInPort(new CABLES.Port(op,"ignore infinity",CABLES.OP_PORT_TYPE_VALUE,{ display:'bool' }));
ignoreInf.set(false);
ignoreInf.onValueChanged=function()
{
    if(ignoreInf.get()) shader.define('FOG_IGNORE_INFINITY');
        else shader.removeDefine('FOG_IGNORE_INFINITY');
};

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);
//op.onLoaded=shader.compile;

var srcFrag=attachments.fog_frag;

shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','depthTex',1);
var textureUniform=new CGL.Uniform(shader,'t','image',0);

var uniDensity=new CGL.Uniform(shader,'f','density',1.0);
density.onValueChanged=function()
{
    uniDensity.setValue(density.get());
};
density.set(5.0);

{
    // fog color

    var r=op.addInPort(new CABLES.Port(op,"fog r",CABLES.OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true' }));
    r.onValueChanged=function()
    {
        if(!r.uniform) r.uniform=new CGL.Uniform(shader,'f','r',r.get());
        else r.uniform.setValue(r.get());
    };

    var g=op.addInPort(new CABLES.Port(op,"fog g",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));
    g.onValueChanged=function()
    {
        if(!g.uniform) g.uniform=new CGL.Uniform(shader,'f','g',g.get());
        else g.uniform.setValue(g.get());
    };

    var b=op.addInPort(new CABLES.Port(op,"fog b",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));
    b.onValueChanged=function()
    {
        if(!b.uniform) b.uniform=new CGL.Uniform(shader,'f','b',b.get());
        else b.uniform.setValue(b.get());
    };

    var a=op.addInPort(new CABLES.Port(op,"fog a",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));
    a.onValueChanged=function()
    {
        if(!a.uniform) a.uniform=new CGL.Uniform(shader,'f','a',a.get());
        else a.uniform.setValue(a.get());
    };

    r.set(Math.random());
    g.set(Math.random());
    b.set(Math.random());
    a.set(1.0);
}


var start=op.addInPort(new CABLES.Port(op,"start",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));
start.onValueChanged=function()
{
    if(!start.uniform) start.uniform=new CGL.Uniform(shader,'f','start',start.get());
    else start.uniform.setValue(start.get());
};
start.set(0);

render.onTriggered=function()
{
    if(!cgl.currentTextureEffect)return;

    if(image.get() && image.get().tex)
    {
        cgl.setShader(shader);
        cgl.currentTextureEffect.bind();

        /* --- */cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );
        // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

        /* --- */cgl.setTexture(1, image.get().tex );
        // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, image.get().tex );

        cgl.currentTextureEffect.finish();
        cgl.setPreviousShader();
    }

    trigger.trigger();
};