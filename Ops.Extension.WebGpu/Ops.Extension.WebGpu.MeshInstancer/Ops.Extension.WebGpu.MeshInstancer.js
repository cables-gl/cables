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

let storage = null;

inGeom.onChange =
inPosBuff.onLinkChanged =
inReset.onTriggered = reset;

function reset()
{
    storage = null;
    needsbuild = true;
    mesh = null;
}

inPosBuff.onChange = () =>
{
    if (storage) reset();
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
            oldPosBuff = inPosBuff.get();
            storage = new CGP.BindingStorage(op.patch.cgp, "arr", { "cgpBuffer": inPosBuff.get() });
            shader.defaultBindGroup.addBinding(storage);
            shader.needsPipelineUpdate = "bindgroup...";
        }
    }
    else
    {

    }
    mesh.instances = inInstances.get() || inPosBuff.get()?.length;

    if (mesh)mesh.render();

    next.trigger();
};
