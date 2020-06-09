
const
    render=op.inTrigger("Render"),
    inWidth=op.inFloat("Width",0.2),
    inPerspective=op.inBool("Width Perspective",true),
    inTexture=op.inTexture("Texture"),
    inTexColorize=op.inBool("Colorize Texture",false),

    r=op.inValueSlider("r",Math.random()),
    g=op.inValueSlider("g",Math.random()),
    b=op.inValueSlider("b",Math.random()),
    a=op.inValueSlider("a",1),

    trigger=op.outTrigger("Trigger"),
    shaderOut=op.outObject("Shader");


r.setUiAttribs({"colorPick":true});

shaderOut.ignoreValueSerialize=true;

const cgl=op.patch.cgl;

op.toWorkPortsNeedToBeLinked(render);
op.setPortGroup("Color",[r,g,b,a]);

const shader=new CGL.Shader(cgl,"splinemesh_material");
shader.setModules(['MODULE_VERTEX_POSITION','MODULE_COLOR','MODULE_BEGIN_FRAG']);
shader.setSource(attachments.splinemat_vert,attachments.splinemat_frag);
shaderOut.set(shader);

shader.addUniformFrag("4f","color",r,g,b,a);
shader.addUniformFrag("f","width",inWidth);
shader.toggleDefine("PERSPWIDTH",inPerspective);


shader.toggleDefine("COLORIZE_TEX",inTexColorize);
shader.toggleDefine("USE_TEXTURE",inTexture);
const uniTex=shader.addUniformFrag("t","tex",inTexture);

render.onTriggered=doRender;

function doRender()
{
    if(!shader)return;

    cgl.pushShader(shader);
    shader.popTextures();

    if(uniTex && inTexture.get()) shader.pushTexture(uniTex,inTexture.get().tex);
    // if(textureOpacityUniform && textureOpacity.get()) shader.pushTexture(textureOpacityUniform,textureOpacity.get().tex);
    trigger.trigger();

    cgl.popShader();
}
