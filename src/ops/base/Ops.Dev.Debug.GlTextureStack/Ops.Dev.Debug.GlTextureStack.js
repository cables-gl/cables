const ex = op.inTrigger("Render");

let m = null;

const cgl = op.patch.cgl;

const shader = new CGL.Shader(cgl, op.name, op);

const num = cgl.maxTextureUnits;

let srcHead = "";
let srcBody = "";

for (let i = 0; i < num; i++)
{
    srcHead += "uniform sampler2D tex" + i + ";\n";

    if (i > 0)srcBody += "else\n";
    srcBody += "if(idx==" + i + ".0) outColor=texture(tex" + i + ",nc);\n";
}

srcBody = attachments.stackmat_frag.replaceAll("{DYNCODE}", srcBody);

shader.setSource(CGL.Shader.getDefaultVertexShader(), srcHead + srcBody);

for (let i = 0; i < num; i++)
{
    shader.addUniformFrag("t", "tex" + i, i);
}

const identView = vec3.create();
vec3.set(identView, 0, 0.75, -1.5);

ex.onTriggered = () =>
{
    if (!m)m = CGL.MESHES.getSimpleRect(op.patch.cgl, "stackdebug");

    cgl.pushViewMatrix();
    mat4.identity(cgl.vMatrix);
    mat4.translate(cgl.vMatrix, cgl.vMatrix, identView);
    cgl.pushModelMatrix();
    mat4.identity(cgl.mMatrix);

    cgl.gl.clear(cgl.gl.DEPTH_BUFFER_BIT);

    m.render(shader);

    cgl.popViewMatrix();
    cgl.popModelMatrix();
};
