// Version 5.0.36
// https://cdn.jsdelivr.net/npm/detect-gpu@5.0.36/dist/detect-gpu.esm.min.js

const inRun = op.inTriggerButton("Run");
const outFinished = op.outTrigger("Finished");

const outTier = op.outNumber("Tier");
const outMobile = op.outBool("Is Mobile");
const outGpu = op.outString("GPU name");
const outFps = op.outNumber("FPS");

inRun.onTriggered = run;

function run()
{
    window.DetectGPU.getGPUTier().then((gpuTier) =>
    {
        outTier.set(gpuTier.tier);
        outMobile.set(gpuTier.isMobile);
        outGpu.set(gpuTier.gpu);
        outFps.set(gpuTier.fps);

        outFinished.trigger();
    });
}
