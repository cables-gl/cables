const inExec = op.inTrigger("Write");

const inTexture = op.inTexture("Texture");
const inNum = op.inValueInt("Num", 8);

const outArr = op.outArray("Result");

const inSort = op.inValueBool("Order");
const inClear = op.inValueBool("Clear", true);

const cgl = op.patch.cgl;
const frameBuf = cgl.gl.createFramebuffer();
const renderbuffer = cgl.gl.createRenderbuffer();
let index = 0;
const textures = [];
let quadMesh = null;
let inited = false;
const sorted = [];

inNum.onChange = init;

const bgFrag = ""
    .endl() + "UNI float a;"
    .endl() + "UNI sampler2D tex;"
    .endl() + "IN vec2 texCoord;"
    .endl() + "void main()"
    .endl() + "{"
    .endl() + "   vec4 col=texture2D(tex,texCoord);"
    .endl() + "   outColor= col;"
    .endl() + "}";
const bgShader = new CGL.Shader(cgl, "imgcompose bg");
bgShader.setSource(bgShader.getDefaultVertexShader(), bgFrag);
const textureUniform = new CGL.Uniform(bgShader, "t", "tex", 0);

inExec.onTriggered = render;

function init()
{
    if (inNum.get() == 0) return;
    for (let i = 0; i < textures.length; i++)
    {
        textures[i].delete();
    }

    if (!inTexture.get()) return;
    textures.length = inNum.get();
    sorted.length = inNum.get();

    // op.log(inTexture.get());

    for (let i = 0; i < inNum.get(); i++)
    {
        textures[i] = inTexture.get().clone();
        // textures[i].updateMipMap();
    }

    // cgl.gl.bindFramebuffer(cgl.gl.FRAMEBUFFER, null);

    // cgl.gl.bindFramebuffer(cgl.gl.FRAMEBUFFER, frameBuf);
    cgl.gl.bindFramebuffer(cgl.gl.FRAMEBUFFER, frameBuf);
    cgl.gl.framebufferTexture2D(cgl.gl.FRAMEBUFFER, cgl.gl.COLOR_ATTACHMENT0, cgl.gl.TEXTURE_2D, textures[0].tex, 0);

    // cgl.gl.bindRenderbuffer(cgl.gl.RENDERBUFFER, renderbuffer);

    // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, null);
    // cgl.gl.bindRenderbuffer(cgl.gl.RENDERBUFFER, null);
    cgl.gl.bindFramebuffer(cgl.gl.FRAMEBUFFER, null);

    // textures[0].updateMipMap();

    inited = true;
}

function createMesh()
{
    const geom = new CGL.Geometry("textureEffect rect");

    geom.vertices = [
        1.0, 1.0, 0.0,
        -1.0, 1.0, 0.0,
        1.0, -1.0, 0.0,
        -1.0, -1.0, 0.0
    ];

    geom.texCoords = [
        1.0, 1.0,
        0.0, 1.0,
        1.0, 0.0,
        0.0, 0.0
    ];

    geom.verticesIndices = [
        0, 1, 2,
        2, 1, 3
    ];

    quadMesh = new CGL.Mesh(cgl, geom);
}

function render()
{
    if (!inTexture.get())
    {
        op.log("no tex 1");
        return;
    }

    if (!inTexture.get().tex)
    {
        op.log("no tex 2");
        return;
    }

    if (!quadMesh)createMesh();
    if (!inited || !frameBuf)init();
    if (!textures[0] || textures.length == 0)
    {
        op.log("no tex");
        return;
    }

    if (!textures[0].compareSettings(inTexture.get()))init();
    // if(inTexture.get().width!=textures[0].width)init();
    // if(inTexture.get().height!=textures[0].height)init();

    index %= inNum.get();

    cgl.gl.bindFramebuffer(cgl.gl.FRAMEBUFFER, frameBuf);
    cgl.gl.framebufferTexture2D(cgl.gl.FRAMEBUFFER, cgl.gl.COLOR_ATTACHMENT0, cgl.gl.TEXTURE_2D, textures[index].tex, 0);
    cgl.pushGlFrameBuffer(frameBuf);

    cgl.pushDepthTest(false);

    if (inClear.get())
    {
        cgl.gl.clearColor(0, 0, 0, 1);
        cgl.gl.clear(cgl.gl.COLOR_BUFFER_BIT | cgl.gl.DEPTH_BUFFER_BIT);
    }

    cgl.pushModelMatrix();

    cgl.pushPMatrix();
    cgl.gl.viewport(0, 0, inTexture.get().width, inTexture.get().height);
    mat4.perspective(cgl.pMatrix, 45, inTexture.get().width / inTexture.get().height, 0.1, 1100.0);

    cgl.pushPMatrix();
    mat4.identity(cgl.pMatrix);

    cgl.pushViewMatrix();
    mat4.identity(cgl.vMatrix);

    cgl.pushModelMatrix();
    mat4.identity(cgl.mMatrix);

    // here be rendering

    cgl.pushShader(bgShader);
    // cgl.currentTextureEffect.bind();

    cgl.setTexture(0, inTexture.get().tex);
    // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D,  );

    quadMesh.render(cgl.getShader());

    cgl.gl.bindFramebuffer(cgl.gl.FRAMEBUFFER, cgl.popGlFrameBuffer());

    cgl.popShader();

    cgl.popDepthTest();
    cgl.popModelMatrix();

    cgl.popPMatrix();
    cgl.popModelMatrix();
    cgl.popViewMatrix();

    cgl.popPMatrix();
    cgl.resetViewPort();

    op.patch.cgl.gl.bindTexture(op.patch.cgl.gl.TEXTURE_2D, textures[index].tex);
    // this._colorTextures[i].updateMipMap();
    textures[index].updateMipMap();
    op.patch.cgl.gl.bindTexture(op.patch.cgl.gl.TEXTURE_2D, null);

    if (inSort.get())
    {
        for (let i = 0; i < textures.length; i++)
        {
            sorted[textures.length - i - 1] = textures[(index + i + 1) % inNum.get()];
        }

        outArr.setRef(sorted);
    }
    else
    {
        outArr.setRef(textures);
    }
    index++;
}
