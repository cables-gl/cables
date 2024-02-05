const
    render = op.inTrigger("render"),
    inAmount = op.inFloatSlider("Amount", 1),
    inMethod = op.inSwitch("Method", ["Override", "Mul", "Add"], "Override"),
    inInvert = op.inBool("Invert", false),
    image = op.inTexture("image"),
    next = op.outTrigger("trigger");

const cgl = this.patch.cgl;
const shader = new CGL.Shader(cgl, op.name, op);
shader.setSource(shader.getDefaultVertexShader(), attachments.alphamask_frag);

const textureUniform = new CGL.Uniform(shader, "t", "tex", 0);
const textureDisplaceUniform = new CGL.Uniform(shader, "t", "image", 1);
const amountUniform = new CGL.Uniform(shader, "f", "amount", inAmount);

// const method = this.addInPort(new CABLES.Port(this, "method", CABLES.OP_PORT_TYPE_VALUE, { "display": "dropdown", "values": ["luminance", "image alpha", "red", "green", "blue"] }));
const method = op.inDropDown("method", ["luminance", "image alpha", "red", "green", "blue"], "luminance");

image.onChange =
inMethod.onChange =
inInvert.onChange =
method.onChange = function ()
{
    shader.toggleDefine("FROM_LUMINANCE", method.get() == "luminance");
    shader.toggleDefine("FROM_ALPHA", method.get() == "image alpha");
    shader.toggleDefine("FROM_RED", method.get() == "red");
    shader.toggleDefine("FROM_GREEN", method.get() == "green");
    shader.toggleDefine("FROM_BLUR", method.get() == "blue");
    shader.toggleDefine("USE_TEXTURE", image.get());

    shader.toggleDefine("INVERT", inInvert.get());
    shader.toggleDefine("METH_MUL", inMethod.get() == "Mul");
    shader.toggleDefine("METH_ADD", inMethod.get() == "Add");
    shader.toggleDefine("METH_OVERRIDE", inMethod.get() == "Override");
};

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op, 3)) return;
    // if (!image.get()) return next.trigger();

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);

    if (image.get() && image.get().tex) cgl.setTexture(1, image.get().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    next.trigger();
};
