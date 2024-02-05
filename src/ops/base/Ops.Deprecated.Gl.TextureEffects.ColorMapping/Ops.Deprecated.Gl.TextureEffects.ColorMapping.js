
op.name = "ColorLookup";

let render = op.inTrigger("render");
let image = op.addInPort(new CABLES.Port(op, "image", CABLES.OP_PORT_TYPE_TEXTURE));
let trigger = op.outTrigger("trigger");

let axis = op.inValueSelect("Axis", ["hotizontal", "vertical"], "horizontal");
let pos = op.inValueSlider("Position");

let cgl = op.patch.cgl;
let shader = new CGL.Shader(cgl, op.name, op);

axis.onChange = updateAxis;
updateAxis();

function updateAxis()
{
    shader.removeDefine("VERT");
    shader.removeDefine("HORI");
    if (axis.get() == "vertical")shader.define("VERT");
    else shader.define("HORI");
}

let srcFrag = ""
    .endl() + "precision highp float;"
    .endl() + "IN vec2 texCoord;"
    .endl() + "UNI sampler2D tex;"
    .endl() + "UNI sampler2D image;"
    .endl() + "UNI float pos;"
    .endl() + ""
    .endl() + "void main()"
    .endl() + "{"
    .endl() + "   vec4 colOrig=texture2D(tex,texCoord);"

    .endl() + "   float gray = dot(vec3(0.2126,0.7152,0.0722), colOrig.rgb );"

    .endl() + "   #ifdef VERT"
    .endl() + "       gl_FragColor.r = texture2D(image,vec2(0.5,colOrig.r)).r;"
    .endl() + "       gl_FragColor.g = texture2D(image,vec2(0.5,colOrig.g)).g;"
    .endl() + "       gl_FragColor.b = texture2D(image,vec2(0.5,colOrig.b)).b;"
    .endl() + "   #endif"

    .endl() + "   #ifdef HORI"
    .endl() + "       gl_FragColor.r = texture2D(image,vec2(colOrig.r,0.5)).r;"
    .endl() + "       gl_FragColor.g = texture2D(image,vec2(colOrig.g,0.5)).g;"
    .endl() + "       gl_FragColor.b = texture2D(image,vec2(colOrig.b,0.5)).b;"
    .endl() + "   #endif"

    .endl() + "   gl_FragColor.a = 1.0;"

    .endl() + "}";

shader.setSource(shader.getDefaultVertexShader(), srcFrag);
let textureUniform = new CGL.Uniform(shader, "t", "tex", 0);
let textureDisplaceUniform = new CGL.Uniform(shader, "t", "image", 1);
let posUni = new CGL.Uniform(shader, "f", "pos", pos);


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
