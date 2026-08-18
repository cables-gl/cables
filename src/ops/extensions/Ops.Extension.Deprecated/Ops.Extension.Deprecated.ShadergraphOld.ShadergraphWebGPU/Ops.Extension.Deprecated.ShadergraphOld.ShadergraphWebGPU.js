const
    inExec = op.inTrigger("Exec"),
    inFrag = op.inObject("Fragment", null, "sg_void"),
    next = op.outTrigger("Next"),
    outshader = op.outObject("Shader"),
    outSrcFrag = op.outString("Source Fragment");
// outSrcVert = op.outString("Source Vertex");

new CABLES.WebGpuOp(op);

const cgp = op.patch.cgp;
let sg;
let shader;
let needsUpdate = true;
let uniformTextures = [];

op.on("loadedValueSet", () =>
{
    // sg = new CGL.ShaderGraph(this, inFrag, inVertex);
    // needsUpdate=true;
    // console.log(sg,op)
    // sg.updateGraph(sg);
});

inExec.onTriggered = () =>
{
    if (!sg)
    {
        sg = new CGL.ShaderGraph(this, CGL.ShaderGraph.LANG_WGSL, inFrag);
        shader = new CGP.Shader(cgp, op.name);
        shader.setModules(["MODULE_COLOR", "MODULE_VERTEX_POSITION"]);
        outshader.set(shader);

        sg.on("compiled", () =>
        {
            outSrcFrag.set(sg.getSrcVert());
            needsUpdate = true;
            outshader.setRef(shader);
        });
    }

    if (needsUpdate)
    {
        uniformTextures = [];
        shader.removeAllUniforms();
        shader.setSource(sg.getSrcVert());

        // const unis = sg.getUniforms();
        // for (let i = 0; i < unis.length; i++)
        // {
        //     const su = unis[i];
        //     shader.removeUniform(su.name);

        //     let uni = null;
        //     if (su.ports) uni = shader.addUniformFrag(su.type, su.name, su.ports[0], su.ports[1], su.ports[2], su.ports[3]);
        //     else console.log("uni has no ports", su.ports);

        //     if (su.type == "t")uniformTextures.push({ "uni": uni, "port": su.ports[0] });
        // }
        needsUpdate = false;
    }
    //  if (shader)shader.needsPipelineUpdate = "jalla";

    console.log("shad", shader);

    // for (let i = 0; i < uniformTextures.length; i++)
    //     shader.pushTexture(uniformTextures[i].uni, uniformTextures[i].port.get());

    cgp.pushShader(shader);

    next.trigger();

    // shader.popTextures();
    cgp.popShader();
};
