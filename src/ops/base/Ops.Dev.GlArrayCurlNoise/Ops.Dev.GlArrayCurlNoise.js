const
    render = op.inTrigger("Render"),
    inTex = op.inTexture("GlArray"),
    scale = op.inValue("Scale", 1),

    x = op.inValue("X", 0),
    y = op.inValue("Y", 0),
    z = op.inValue("Z", 0),
    a = op.inValue("a", 1),
    trigger = op.outTrigger("trigger"),
    outTex = op.outTexture("Result");

render.onTriggered = dorender;

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, op.name);
const texMath = new CGL.ShaderTextureMath(cgl, op.objName, { "texturePort": inTex });

shader.setSource(shader.getDefaultVertexShader(), attachments.curlnoise_frag);
const textureUniform = new CGL.Uniform(shader, "t", "tex", 0);
const uniformR = new CGL.Uniform(shader, "f", "x", x);
const uniformG = new CGL.Uniform(shader, "f", "y", y);
const uniformB = new CGL.Uniform(shader, "f", "z", z);
const uniformA = new CGL.Uniform(shader, "f", "scale", scale);

updateDefines();

function updateDefines()
{
    // shader.toggleDefine("MOD_OP_SUB_CX", inOp.get() === "c-x");
    // shader.toggleDefine("MOD_OP_SUB_XC", inOp.get() === "x-c");

    // shader.toggleDefine("MOD_OP_ADD", inOp.get() === "c+x");
    // shader.toggleDefine("MOD_OP_MUL", inOp.get() === "c*x");

    // shader.toggleDefine("MOD_OP_DIV_XC", inOp.get() === "x/c");
    // shader.toggleDefine("MOD_OP_DIV_CX", inOp.get() === "c/x");

    // shader.toggleDefine("MOD_OP_MODULO", inOp.get() === "c%x");

    // shader.toggleDefine("MOD_CHAN_R", chanR.get());
    // r.setUiAttribs({ "greyout": !chanR.get() });

    // shader.toggleDefine("MOD_CHAN_G", chanG.get());
    // g.setUiAttribs({ "greyout": !chanG.get() });

    // shader.toggleDefine("MOD_CHAN_B", chanB.get());
    // b.setUiAttribs({ "greyout": !chanB.get() });

    // shader.toggleDefine("MOD_CHAN_A", chanA.get());
    // a.setUiAttribs({ "greyout": !chanA.get() });
}

function dorender()
{
    outTex.set(null);
    const finTex = texMath.render(shader);
    outTex.set(finTex);
    trigger.trigger();
}

// const
//     render=op.inTrigger("render"),
//     blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal"),
//     amount=op.inValueSlider("Amount",1),
//     scale=op.inValue("Scale",22),
//     x=op.inValue("X",0),
//     y=op.inValue("Y",0),
//     z=op.inValue("Z",0),
//     trigger=op.outTrigger("trigger");

// const cgl=op.patch.cgl;
// const shader=new CGL.Shader(cgl,'perlinnoise');

// op.setPortGroup("Position",[x,y,z]);

// shader.setSource(shader.getDefaultVertexShader(),attachments.perlinnoise3d_frag );

// const
//     textureUniform=new CGL.Uniform(shader,'t','tex',0),
//     uniZ=new CGL.Uniform(shader,'f','z',z),
//     uniX=new CGL.Uniform(shader,'f','x',x),
//     uniY=new CGL.Uniform(shader,'f','y',y),
//     uniScale=new CGL.Uniform(shader,'f','scale',scale),
//     amountUniform=new CGL.Uniform(shader,'f','amount',amount);

// CGL.TextureEffect.setupBlending(op,shader,blendMode,amount);

// render.onTriggered=function()
// {
//     if(!CGL.TextureEffect.checkOpInEffect(op)) return;

//     cgl.pushShader(shader);
//     cgl.currentTextureEffect.bind();

//     cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

//     cgl.currentTextureEffect.finish();
//     cgl.popShader();

//     trigger.trigger();
// };
