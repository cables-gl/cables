const
    inTrigger = op.inTrigger("Render"),
    inGeom = op.inObject("Geometry", null, "geometry"),
    inPosBuff = op.inObject("Pos Buffer"),
    inScaleBuff = op.inObject("Scale Buffer"),
    inInstances = op.inInt("Num Instances", 0),
    inBillboarding = op.inSwitch("Billboarding", ["Off", "Spherical", "Cylindrical"], "Off"),
    inReset = op.inTriggerButton("Reset"),
    inTest = op.inTriggerButton("test"),
    next = op.outTrigger("Next"),
    outNum = op.outNumber("Total Instances");

const gpu = new CABLES.WebGpuOp(op);

let gpuBuff = null;
let mesh = null;
let cgp = op.patch.cgp;
let needsbuild = true;
let needsChange = false;
let oldPosBuff = null;
let oldScaleBuff = null;
let storage = null;
let storageScale = null;
let refresh = false;

inGeom.onChange =
    inScaleBuff.onLinkChanged =
    inPosBuff.onLinkChanged =
    inReset.onTriggered = reset;

function reset()
{
    storage = null;
    oldScaleBuff = null;
    needsbuild = true;
    mesh = null;
}

inScaleBuff.onChange =
inPosBuff.onChange = () =>
{
    if (storage || storageScale) reset();
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
    }

    const shader = cgp.getShader();
    shader.toggleDefine("INSTANCING", true);
    shader.toggleDefine("BILLBOARDING", inBillboarding.get() != "Off");
    shader.toggleDefine("BILLBOARDING_CYLINDRIC", inBillboarding.get() == "Cylindrical");

    if (inPosBuff.isLinked() && inPosBuff.get())
    {
        if (!storage)
        {
            storage = new CGP.BindingStorage(op.patch.cgp, "instPos", { "cgpBuffer": inPosBuff.get() });
            shader.defaultBindGroup.addBinding(storage);
            shader.needsPipelineUpdate = "bindgroup..."; shader.compile();
            shader.needsRecompile();// why is this needed
        }
    }

    if (inScaleBuff.isLinked() && inScaleBuff.get())
    {
        if (!storageScale)
        {
            storageScale = new CGP.BindingStorage(op.patch.cgp, "instScale", { "cgpBuffer": inScaleBuff.get() });
            shader.defaultBindGroup.addBinding(storageScale);
            shader.needsPipelineUpdate = "bindgroup...";
            shader.needsRecompile(); // why is this needed
        }
    }

    mesh.instances = inInstances.get() || inPosBuff.get()?.length;

    if (refresh)
    {
        // shader.needsPipelineUpdate = "bindgroup...";
        shader.compile();
        refresh = false;
    }
    if (mesh)mesh.render();

    next.trigger();
};
inTest.onTriggered = () =>
{
    refresh = true;
};
