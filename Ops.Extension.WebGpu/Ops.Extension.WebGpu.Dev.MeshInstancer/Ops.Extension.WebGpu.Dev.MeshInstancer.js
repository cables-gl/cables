const
    inTrigger = op.inTrigger("Render"),
    inGeom = op.inObject("Geometry", null, "geometry"),
    inPosBuff = op.inObject("Pos Buffer"),
    inInstances = op.inInt("Num Instances", 0),
    inBillboarding = op.inSwitch("Billboarding", ["Off", "Spherical", "Cylindrical"], "Off"),
    inReset = op.inTriggerButton("Reset"),
    next = op.outTrigger("Next"),
    outNum = op.outNumber("Total Instances");

const gpu = new CABLES.WebGpuOp(op);

let gpuBuff = null;
let mesh = null;
let cgp = op.patch.cgp;
let needsbuild = true;
let needsChange = false;
let oldPosBuff = null;

inGeom.onChange =
inPosBuff.onLinkChanged =
inReset.onTriggered = () =>
{
    needsbuild = true;
    mesh = null;
};

inTrigger.onTriggered = () =>
{
    cgp = op.patch.cgp;

    if (needsbuild || !mesh)
    {
        if (mesh)mesh.dispose();
        const geom = inGeom.get();
        if (!geom)mesh = CGP.MESHES.getSimpleRect(cgp, "meshInstDefaultRect", 0.1);
        else mesh = op.patch.cg.createMesh(geom, { "opId": op.id });
        needsbuild = false;
        console.log("new mesh");
    }

    const shader = cgp.getShader();
    const u = shader.getUniform("arr");

    if (!u) return op.log("no uniform");

    shader.toggleDefine("INSTANCING", true);
    shader.toggleDefine("BILLBOARDING", inBillboarding.get() != "Off");
    shader.toggleDefine("BILLBOARDING_CYLINDRIC", inBillboarding.get() == "Cylindrical");

    if (inPosBuff.isLinked() && inPosBuff.get() && u)
    {
        mesh.instances = inInstances.get() || inPosBuff.get().length;

        outNum.set(mesh.instances);

        // console.log("sss",inPosBuff.get().gpuBuffer)
        if (u.gpuBuffer != inPosBuff.get())
        {
            oldPosBuff = u.gpuBuffer;
            // u.gpuBuffer = inPosBuff.get();
            u.setGpuBuffer(inPosBuff.get());
            shader.needsPipelineUpdate = "change gpubuffer uniform";
        }
    }
    else
    {
        if (u.gpuBuffer != null)
        {
            u.gpuBuffer = oldPosBuff;
            oldPosBuff = null;
        }
        u.setGpuBuffer(null);
    }

    if (mesh)mesh.render();

    next.trigger();
};
