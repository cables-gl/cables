const
    inExec = op.inTrigger("Exec"),
    inFunc = op.inObject("Fragment", null, "sg_func"),
    next = op.outTrigger("Next"),
    outshader = op.outObject("Shader"),
    outSrcFrag = op.outString("Source Fragment");

const cgl = op.patch.cgl;
const sg = new CGL.ShaderGraph(this, inFunc);
const shader = new CGL.Shader(cgl, op.name);
let needsUpdate = true;

shader.setModules(["MODULE_VERTEX_POSITION", "MODULE_COLOR", "MODULE_BEGIN_FRAG"]);

sg.on("compiled", () =>
{
    outSrcFrag.set(sg.getSrcFrag());
});

inExec.onTriggered = () =>
{
    if (needsUpdate)
    {
        shader.setSource(CGL.Shader.getDefaultVertexShader(), sg.getSrcFrag());
    }

    cgl.pushShader(shader);

    next.trigger();

    cgl.popShader();
};
