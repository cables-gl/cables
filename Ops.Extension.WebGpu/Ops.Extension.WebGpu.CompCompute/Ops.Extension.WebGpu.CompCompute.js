const
    compute = op.inTrigger("Compute"),
    inSrc = op.inStringEditor("Source", op.attachments.compute_wgsl, "glsl"),
    inWg1 = op.inInt("Workgroups 1", 64),
    inWg2 = op.inInt("Workgroups 2", 64),
    inWg3 = op.inInt("Workgroups 3", 0),
    inForce = op.inTriggerButton("Force Update"),
    next = op.outTrigger("Next"),
    outCode = op.outString("Code"),
    outBuff = op.outObject("Buffer"),
    outLen = op.outNumber("Length");

new CABLES.WebGpuOp(op);

let comp = null;
let needsInit = true;
let computePipeline = null;
let workGroups = [64, 64];
let gpuBuff = null;
let bindGroup = null;
let arrSize = 300;
let pipe = null;
let shader = null;
let binding = null;

inWg1.onChange =
inWg2.onChange =
inWg3.onChange = () =>
{
    workGroups = [inWg1.get() || 8];
    if (inWg2.get())workGroups.push(inWg2.get());
    if (inWg3.get())workGroups.push(inWg3.get());
};

inForce.onTriggered = () =>
{
    if (shader)shader.needsPipelineUpdate = "force update...";
};

inSrc.onChange = () =>
{
    needsInit = true;
};

compute.onTriggered = () =>
{
    const cgp = op.patch.cgp;
    if (needsInit) init(cgp);

    cgp.pushShader(shader);

    next.trigger();
    if (pipe) pipe.compute(shader, this.workGroups);

    if (needsInit)
        outCode.set(shader.getProcessedSource());

    needsInit = false;

    outBuff.setRef(gpuBuff);
    cgp.popShader();
};

function init(cgp)
{
    if (shader)shader.dispose();
    if (pipe)pipe.dispose();
    console.log("init");
    pipe = new CGP.ComputePipeline(cgp, op.objName);

    shader = new CGP.Shader(cgp, op.name, { "compute": true });
    shader.setSource(inSrc.get());
    shader.addUniform(new CGP.Uniform(shader, "4f", "color", [1, 1, 1, 1]), GPUShaderStage.COMPUTE);
    shader.addUniform(new CGP.Uniform(shader, "4f", "colorw", [1, 1, 1, 1]), GPUShaderStage.COMPUTE);
    // console.log("code",shader.getProcessedSource())
    // gpuBuff = new CABLES.CGP.GPUBuffer(op.patch.cgp, op.objName, [], {
    //     "length": arrSize,
    // });
    // binding = new CGP.BindingStorage(cgp, "resultMatrix", {
    //     "stage": GPUShaderStage.COMPUTE,
    //     "shader": shader,
    //     "bindingType": "storage",
    //     "cgpBuffer": gpuBuff });

    // shader.defaultBindGroup.addBinding(binding);

    // console.log("shader.defaultBindGroup", shader.defaultBindGroup);
    outCode.set(shader.getProcessedSource());

    needsInit = false;

    outLen.set(arrSize);
}
