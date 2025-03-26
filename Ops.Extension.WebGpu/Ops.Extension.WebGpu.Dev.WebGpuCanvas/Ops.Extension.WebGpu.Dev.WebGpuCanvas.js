const
    inEnabled = op.inBool("Active", true),
    hdpi = op.inFloat("Max Pixel Density (DPR)", 2),
    inCatchErrs = op.inBool("Catch Errors", true),
    inStopErrs = op.inBool("Stop on Errors", true),
    inDoProfile = op.inBool("Profile", true),
    next = op.outTrigger("Next"),
    next2 = op.outTrigger("Next2"),
    supported = op.outBoolNum("Supported", false),
    outMs = op.outNumber("MS Frame"),
    outLimits = op.outObject("Limits"),
    outEle = op.outObject("Canvas", null, "element"),
    outElePrev = op.outObject("Canvas Prev", null, "element"),
    outProfiler = op.outObject("Profiler Data", null);

const gpu = new CABLES.WebGpuOp(op);

let cgp = op.patch.cgp;
let canvas = null;
let device = null;
let context = null, pipeline = null, contextPrev = null;
let container = null;
let stopped = false;
let hadError = false;
let renderPreview = !!CABLES.UI;

canvas = document.createElement("canvas");
canvas.id = "webgpucanvas";
canvas.setAttribute("tabindex", 0);
canvas.style.width = 128 + "px";
canvas.style.height = 128 + "px";
canvas.style.right = 0 + "px";
canvas.style["z-index"] = "22222";
canvas.style.borderTop = "1px solid red";
canvas.style.position = "absolute";
outEle.setRef(canvas);

let canvasId = "cablescanvas";
container = document.getElementById(canvasId);

// const canvas2 = document.createElement("canvas");
// canvas2.id = "webgpucanvasOut";
// canvas2.style.width = 128 + "px";
// canvas2.style.height = 128 + "px";
// outElePrev.setRef(canvas2);
// cgp.tempPrevCanvas=canvas2;

// const previewCanvasAttachments=[new CGP.WebGpuCanvasAttachment(cgp)];

if (op.patch.config.glCanvasId)
{

}
if (op.patch.config.glCanvasId)
{
    console.log("webgpu canvas container via glCanvasId");
    canvasId = op.patch.config.glCanvasId;
    container = document.getElementById(canvasId).parentElement;
    console.log(container);
}

container.appendChild(canvas);

const pm = mat4.create();

let renderTarget = null;
let depthTexture = null;
let depthTexturePrev = null;
let canvasInfo = {};

let sizeWidth = 0;
let sizeHeight = 0;

// op.patch.cgp = op.patch.cgp || new CABLES.CGP.Context(op.patch);
// new CABLES.WebGpuOp(op);

// const cgp = op.patch.cgp;
const sampleCount = 1;

cgp.setCanvas(canvas);
if (op.patch.cgCanvas)console.log("patch cgcanvas already exists..."); // todo add/manage child canvase
op.patch.cgCanvas = new CABLES.CG.CgCanvas(
    {
        "canvasEle": canvas,
        "cg": cgp

    });

inDoProfile.onChange = () =>
{
    cgp.profiler = null;
    outProfiler.set(null);
};

function setUnSupported(msg)
{
    if (!CABLES.UI)
        op.logError("Your browser does not support WebGPU: " + (msg || ""));

    container.innerHTML = "<br/><br/><br/>Sorry, your browser does not support WebGPU! " + (msg || "");
    container.style.color = "red";
    container.style.textAlign = "center";
    container.style.fontSize = "20px";
    canvas.classList.add("unsupported");

    supported.set(false);
}

if (CABLES.UI)
{
    gui.canvasManager.addContext(cgp);
    gui.canvasManager.setCurrentCanvas(cgp);

    // setTimeout(() =>
    // {
    //     gui.emitEvent("resizecanvas");
    //     gui.setLayout();
    // }, 200);
}

inCatchErrs.onChange = () =>
{
    cgp.catchErrors = inCatchErrs.get();
};

inEnabled.onChange = () =>
{
    if (inEnabled.get()) requestAnimationFrame(frame);
};

op.onDelete = () =>
{
    stopped = true;
    canvas.remove();
    device =
        op.patch.cgp.device =
        op.patch.cgp.adapter =
        op.patch.cgp.pipeline = null;
};

if (!navigator.gpu)
{
    const warn = "Your browser does not support webGPU";
    setUnSupported();
}

if (navigator.gpu)
    navigator.gpu.requestAdapter()
        .catch((e) =>
        {
            setUnSupported("could not get adapter exception...");
        })
        .then((adapter) =>
        {
            if (!adapter)
            {
                setUnSupported("could not get adapter...");
                return;
            }
            adapter.requestDevice().then((_device) =>
            {
                if (!adapter)
                {
                    setUnSupported("could not get device...");
                    return;
                }

                canvas.style.border = "0px solid black";

                cgp.setCanvas(canvas);
                cgp.setSize(container.clientWidth, container.clientHeight);

                supported.set(true);
                device = _device;

                //

                const limits = {};
                for (let i in device.limits) limits[i] = device.limits[i];
                outLimits.setRef(limits);

                //

                cgp.setDevice(device);
                cgp.adapter = adapter;
                cgp.setCanvas(canvas);

                console.log(adapter);
                console.log(device);

                device.addEventListener("uncapturederror", (event) =>
                {
                    if (hadError) return;
                    hadError = true;
                    op.logError("A WebGPU error was not captured:", event.error);

                    if (inStopErrs.get())
                    {
                        console.log("stopping patch on error.....");
                        op.patch.aborted = true;
                        op.patch.pause();
                    }
                });

                context = canvas.getContext("webgpu");
                if (!context)
                {
                    console.log("no context", canvas, context);
                }
                cgp.context = context;

                createTargets(cgp);

                cgp.canvasInfo = canvasInfo;

                requestAnimationFrame(frame);
            });
        });

function createTargets(cgp)
{
    if (!op.patch.isPlaying || stopped || !inEnabled.get()) return;

    const devicePixelRatio = 1;// window.devicePixelRatio || 1;

    sizeWidth = canvas.clientWidth * devicePixelRatio;
    sizeHeight = canvas.clientHeight * devicePixelRatio;

    // if (inSizeAuto.get())
    cgp.setSize(sizeWidth, sizeHeight);

    const presentationFormat = navigator.gpu.getPreferredCanvasFormat(cgp.adapter);
    cgp.presentationFormat = presentationFormat;

    context.configure({
        device,
        "format": presentationFormat
    });

    // contextPrev.configure({
    //     device,
    //     "format": presentationFormat
    // });

    if (renderTarget)renderTarget.destroy();
    if (depthTexture)depthTexture.destroy();
    try
    {
        renderTarget = device.createTexture(
            {
                "size": [sizeWidth, sizeHeight],
                "format": presentationFormat,
                "sampleCount": sampleCount,
                "usage": GPUTextureUsage.RENDER_ATTACHMENT,
            });

        depthTexture = device.createTexture({
            "size": [sizeWidth, sizeHeight],
            "format": "depth24plus",
            "sampleCount": sampleCount,
            "usage": GPUTextureUsage.RENDER_ATTACHMENT,
        });

        depthTexturePrev = device.createTexture({
            "size": [sizeWidth, sizeHeight],
            "format": "depth24plus",
            "sampleCount": sampleCount,
            "usage": GPUTextureUsage.RENDER_ATTACHMENT,
        });
    }
    catch (exc)
    {
        console.log(exc);
    }
}

function frame()
{
    if (!supported.get()) return;
    if (!op.patch.isPlaying || stopped || !inEnabled.get()) return;
    if (!device)
    {
        requestAnimationFrame(frame);
        return;
    }

    const devicePixelRatio = 1;
    if (sizeWidth != canvas.clientWidth * devicePixelRatio || sizeHeight != canvas.clientHeight * devicePixelRatio)
        createTargets(cgp);

    // render(true);
    render(false);

    if (!stopped)requestAnimationFrame(frame);
}

function render(b)
{
    if (op.patch.aborted || op.patch.paused)
    {
        op.setUiError("id", "webgpu error - patch execution halted");
        return;
    }

    if (inDoProfile.get() && CABLES.BranchStack)
    {
        if (!cgp.branchProfiler) cgp.branchProfiler = new CABLES.BranchStack();

        cgp.branchProfiler.start();
    }

    cgp.commandEncoders = [];
    const commandEncoder = device.createCommandEncoder({ "label": op.objName });
    cgp.commandEncoder = commandEncoder;

    cgp.textureView = renderTarget.createView();
    cgp.canvasInfo.depthTextureView = depthTexture.createView();

    cgp.renderPassDescriptor = {
        "label": "main renderpass",
        "colorAttachments": [
            {
                "view": context.getCurrentTexture().createView(),
                "loadOp": "clear",
                "storeOp": "store",
                "clearValue": { "r": 0.1, "g": 0.1, "b": 0.1, "a": 1.0 }
            },
        ],
        "depthStencilAttachment": {
            "view": cgp.canvasInfo.depthTextureView,
            "depthClearValue": 1,
            "depthLoadOp": "clear",
            "depthStoreOp": "store",
        },
    };
    cgp.passEncoder = commandEncoder.beginRenderPass(cgp.renderPassDescriptor);

    op.patch.cg = cgp;
    cgp.renderStart();

    const oldCgl = op.patch.cgl;
    op.patch.cgl = null; // force crash if something tries to use it

    next.trigger();

    outMs.set(op.patch.cgp.fpsCounter.stats.ms);

    op.patch.cgl = oldCgl;

    cgp.renderEnd();
    cgp.passEncoder.end();

    /// //////////////////////////////////////////
    if (renderPreview)
    {
        // gui.patchView.patchRenderer.vizLayer.renderWebGpuPreviews(cgp);
    }

    cgp.device.queue.submit([cgp.commandEncoder.finish()]);

    if (inDoProfile.get() && cgp.branchProfiler)
    {
        cgp.branchProfiler.finish();
        outProfiler.setRef(cgp.branchProfiler);
    }
}
