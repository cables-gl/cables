const
    inExec = op.inTrigger("Exec"),
    inFrag = op.inObject("Fragment", null, "sg_void"),
    inVertex = op.inObject("Vertex", null, "sg_void"),
    next = op.outTrigger("Next"),
    outshader = op.outObject("Shader"),
    outSrcFrag = op.outString("Source Fragment"),
    outSrcVert = op.outString("Source Vertex");

const cgl = op.patch.cgl;
const sg = new CGL.ShaderGraph(this, inFrag, inVertex);
const shader = new CGL.Shader(cgl, op.name);
let needsUpdate = true;

shader.setModules(["MODULE_VERTEX_POSITION", "MODULE_COLOR", "MODULE_BEGIN_FRAG", "MODULE_BEGIN_VERTEX"]);
outshader.set(shader);

let uniformTextures = [];

sg.on("compiled", () =>
{
    outSrcFrag.set(sg.getSrcFrag());
    outSrcVert.set(sg.getSrcVert());
    needsUpdate = true;
});

inExec.onTriggered = () =>
{
    if (needsUpdate)
    {
        uniformTextures = [];
        shader.removeAllUniforms();

        shader.setSource(sg.getSrcVert(), sg.getSrcFrag());

        const unis = sg.getUniforms();
        for (let i = 0; i < unis.length; i++)
        {
            const su = unis[i];
            shader.removeUniform(su.name);

            let uni = null;
            if (su.ports) uni = shader.addUniformFrag(su.type, su.name, su.ports[0], su.ports[1], su.ports[2], su.ports[3]);
            else console.log("uni has no ports", su.ports);

            if (su.type == "t")uniformTextures.push({ "uni": uni, "port": su.ports[0] });
        }
        needsUpdate = false;
    }

    for (let i = 0; i < uniformTextures.length; i++)
        shader.pushTexture(uniformTextures[i].uni, uniformTextures[i].port.get());

    cgl.pushShader(shader);

    next.trigger();

    shader.popTextures();
    cgl.popShader();
};
