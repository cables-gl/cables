const render=op.inTrigger('render');
const blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal");
const amount=op.inValueSlider("Amount",1);
const trigger=op.outTrigger('trigger');
const smooth=op.inValueBool("Smooth",false);

const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl);

const srcFrag=(attachments.border_frag||'').replace("{{BLENDCODE}}",CGL.TextureEffect.getBlendCode());
shader.setSource(shader.getDefaultVertexShader(),srcFrag);

const textureUniform=new CGL.Uniform(shader,'t','tex',0);
const amountUniform=new CGL.Uniform(shader,'f','amount',amount);
const aspectUniform=new CGL.Uniform(shader,'f','aspect',0);
const uniSmooth=new CGL.Uniform(shader,'b','smoothed',smooth);

{
    const width=op.inValue("width",0.1);

    const uniWidth=new CGL.Uniform(shader,'f','width',width.get());

    width.onValueChange(function()
    {
        uniWidth.setValue(width.get()/2 );
    });
}

const r = op.inValueSlider("r", Math.random());
const g = op.inValueSlider("g", Math.random());
const b = op.inValueSlider("b", Math.random());
r.setUiAttribs({ colorPick: true });

const unir=new CGL.Uniform(shader,'f','r',r);
const unig=new CGL.Uniform(shader,'f','g',g);
const unib=new CGL.Uniform(shader,'f','b',b);

// {
//     var r=op.addInPort(new CABLES.Port(op,"diffuse r",CABLES.OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true' }));
//     r.onChange=function()
//     {
//         if(!r.uniform) r.uniform=new CGL.Uniform(shader,'f','r',r.get());
//             else r.uniform.setValue(r.get());
//     };

//     var g=op.addInPort(new CABLES.Port(op,"diffuse g",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));
//     g.onChange=function()
//     {
//         if(!g.uniform) g.uniform=new CGL.Uniform(shader,'f','g',g.get());
//             else g.uniform.setValue(g.get());
//     };

//     var b=op.addInPort(new CABLES.Port(op,"diffuse b",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));
//     b.onChange=function()
//     {
//         if(!b.uniform) b.uniform=new CGL.Uniform(shader,'f','b',b.get());
//             else b.uniform.setValue(b.get());
//     };

//     r.set(Math.random());
//     g.set(Math.random());
//     b.set(Math.random());
// }

CGL.TextureEffect.setupBlending(op,shader,blendMode,amount);

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
