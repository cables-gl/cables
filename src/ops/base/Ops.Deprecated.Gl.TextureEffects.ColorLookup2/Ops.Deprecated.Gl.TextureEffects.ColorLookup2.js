
op.name = "ColorLookup";

let render = op.inTrigger("render");
let amount = op.addInPort(new CABLES.Port(op, "amount", CABLES.OP_PORT_TYPE_VALUE, { "display": "range" }));
let posy = op.addInPort(new CABLES.Port(op, "pos", CABLES.OP_PORT_TYPE_VALUE, { "display": "range" }));
let image = op.addInPort(new CABLES.Port(op, "image", CABLES.OP_PORT_TYPE_TEXTURE));
let trigger = op.outTrigger("trigger");

// var vert=op.addOutPort(new CABLES.Port(op,"vertical",CABLES.OP_PORT_TYPE_FUNCTION));
let vert = op.inValueBool("vertical", true);

let cgl = op.patch.cgl;
let shader = new CGL.Shader(cgl, op.name, op);

amount.set(1);

let srcFrag = ""
    .endl() + "precision highp float;"
    .endl() + "  IN vec2 texCoord;"
    .endl() + "  uniform sampler2D tex;"
    .endl() + "  uniform sampler2D image;"
    .endl() + "  uniform float pos;"
    .endl() + "uniform float amount;"
    .endl() + ""
    .endl() + ""
    .endl() + "void main()"
    .endl() + "{"
    .endl() + "   vec4 col=vec4(0.0,0.0,0.0,1.0);"
    .endl() + "   vec4 colOrig=texture2D(tex,texCoord);"


    .endl() + "#ifdef VERT"
    .endl() + "   col.r=texture2D(image,vec2(colOrig.r,pos)).r;"
    .endl() + "   col.g=texture2D(image,vec2(colOrig.g,pos)).g;"
    .endl() + "   col.b=texture2D(image,vec2(colOrig.b,pos)).b;"
    .endl() + "#endif"

    .endl() + "#ifdef HORI"
    .endl() + "   col.r=texture2D(image,vec2(pos,colOrig.r)).r;"
    .endl() + "   col.g=texture2D(image,vec2(pos,colOrig.g)).g;"
    .endl() + "   col.b=texture2D(image,vec2(pos,colOrig.b)).b;"
    .endl() + "#endif"

    .endl() + "   col.a=1.0;"
    .endl() + "   gl_FragColor = col;"
    .endl() + "}";

shader.setSource(shader.getDefaultVertexShader(), srcFrag);
let textureUniform = new CGL.Uniform(shader, "t", "tex", 0);
let textureDisplaceUniform = new CGL.Uniform(shader, "t", "image", 1);
updateDir();
let amountUniform = new CGL.Uniform(shader, "f", "amount", amount.get());

vert.onChange = updateDir;

function updateDir()
{
    shader.removeDefine("VERT");
    shader.removeDefine("HORI");

    if (vert.get())shader.define("VERT");
    else shader.define("HORI");
}

amount.onChange = function ()
{
    amountUniform.setValue(amount.get());
};

let posyUniform = new CGL.Uniform(shader, "f", "pos", posy.get());

posy.onChange = function ()
{
    posyUniform.setValue(posy.get());
};

posy.set(0.0);

render.onTriggered = function ()
{
    if (!cgl.currentTextureEffect) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);


    if (image.get() && image.get().tex)
    {
        cgl.setTexture(1, image.get().tex);
        // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, image.get().tex );
    }

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
