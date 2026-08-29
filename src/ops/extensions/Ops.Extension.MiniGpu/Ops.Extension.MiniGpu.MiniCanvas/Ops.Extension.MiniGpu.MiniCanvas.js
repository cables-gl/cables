const
    active = op.inBool("Active", true),
    next = op.outTrigger("next"),
    outSupported = op.outBoolNum("Supported"),
    outEle = op.outObject("Canvas", null, "element");

let canvas = document.createElement("canvas");
let presentationFormat = null;
let device = null;
let context = null;
let pipeline = null;
let mgpu = {};
let rt = null;
let lastTs = 0;
const devicePixelRatio = window.devicePixelRatio;

document.body.style.margin = "0px";
document.body.style.backgroundColor = "black";

/* minimalcore:start */
canvas = canvas || document.body;
canvas.classList.add("cablescontext");
canvas.dataset.contextname = "minigpu";
canvas.dataset.api = "webgpu";
let fpsTime = 0;
let frames = 0;

/* minimalcore:end */

let errorDiv = null;
active.onChange = start;

function showError(msg)
{
    if (!errorDiv)
    {
        errorDiv = document.createElement("div");
        (op.patch.config.containerElement || document.body).appendChild(errorDiv);
        errorDiv.style = "position:absolute;top:0px;border:2px solid red;";
    }
    errorDiv.innerHTML += msg;

    outSupported.set(false);
}

CABLES.idleCallback(start);

function start()
{
    if (!active.get()) return;
    if (!navigator.gpu)
    {
        showError("WebGPU is not supported in this browser / make sure of HTTPS");
    }
    else
        navigator.gpu.requestAdapter(
            {
                "featureLevel": "compatibility"
            }).then(
            (adapter) =>
            {
                if (!adapter)
                    showError("no suitable webgpu adapter found");
                else
                    adapter.requestDevice(
                        {
                            "requiredLimits":
                        {
                            "maxStorageBuffersInVertexStage": 5
                        }
                        }).then(
                        (_device) =>
                        {
                            device = _device;
                            device.lost.then((info) =>
                            {
                                op.logError("WebGPU device lost: " + info.message + " (reason: " + info.reason + ")");
                            });

                            outSupported.set(true);
                            (op.patch.config.containerElement || document.body).appendChild(canvas);
                            canvas.style.width = "100%";
                            canvas.style.height = "100%";
                            context = canvas.getContext("webgpu");

                            setSize(canvas.clientWidth, canvas.clientHeight);
                            outEle.setRef(canvas);
                            requestAnimationFrame(frame);
                        });
            });

}

function setSize(width, height, mul = devicePixelRatio)
{
    mul = 1;

    if (canvas.width != width * mul || canvas.height != height * mul)
    {
        canvas.width = width * mul;
        canvas.height = height * mul;
        rt = null;

        presentationFormat = navigator.gpu.getPreferredCanvasFormat();
        context.configure(
            {
                "device": device,
                "format": presentationFormat
            });
    }
}

/// ///////////
const resizeObserver = new ResizeObserver((entries) =>
{
    const entry = entries[0];
    if (entry && entry.contentRect.width && entry.contentRect.height)
        setSize(entry.contentRect.width, entry.contentRect.height);
});

op.patch.renderloop = { "frameNum": 0, "resume": () => {}, "pause": () => {}, "paused": false };
resizeObserver.observe(canvas);
/// ///////////

function frame(timestamp)
{
    if (!CABLES.UI) op.patch.updateAnims(null, timestamp - lastTs || timestamp, timestamp);

    op.patch.renderloop.frameNum++;

    /* minimalcore:start */
    const timeStart = performance.now();

    /* minimalcore:end */

    const commandEncoder = device.createCommandEncoder();
    const textureView = context.getCurrentTexture().createView();

    op.patch.emitEvent("onRenderFrame", op.patch.timer.getTime());
    if (!presentationFormat) return;
    mgpu.canvas = canvas;
    mgpu.matModel = new CABLES.Stack("matModel", MGPU.mm.identity());
    mgpu.matView = new CABLES.Stack("matView", MGPU.mm.identity());
    mgpu.matProj = new CABLES.Stack("matProj", MGPU.mm.perspective(45 * Math.PI / 180, canvas.clientWidth / canvas.clientHeight, 0.1, 100));
    mgpu.shader = new CABLES.Stack("shader");
    mgpu.target = new CABLES.Stack("target");
    mgpu.commandEncoder = commandEncoder;
    mgpu.device = device;
    mgpu.context = context;
    mgpu.format = presentationFormat;
    mgpu.timeDelta = (timestamp - (lastTs || timestamp)) / 1000;
    lastTs = timestamp;

    op.patch.frameStore.mgpu = mgpu;
    if (!rt)
    {
        rt = new MGPU.RenderTarget(mgpu,
            {
                "label": "canvasRt",
                "copyToCanvas": true,
                "sampleCount": 1
            // "view": context.getCurrentTexture().createView(),
            //  "resolveTarget": true,
            });
    }

    rt.start();
    next.trigger();
    rt.end();

    device.queue.submit([commandEncoder.finish()]);

    requestAnimationFrame(frame);

    /* minimalcore:start */

    mgpu.target.checkEmpty();
    mgpu.shader.checkEmpty();

    frames++;
    if (performance.now() - fpsTime > 1000)
    {
        canvas.dataset.perfms = Math.round((performance.now() - timeStart) * 100) / 100;
        canvas.dataset.perffps = frames;
        fpsTime = performance.now();
        frames = 0;
    }

    /* minimalcore:end */
}

/* minimalcore:start */
op.onDelete = () =>
{
    canvas.remove();
};

/* minimalcore:end */
