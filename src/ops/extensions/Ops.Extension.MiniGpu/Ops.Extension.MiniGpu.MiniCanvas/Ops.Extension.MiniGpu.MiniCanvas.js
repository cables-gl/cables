const
    next = op.outTrigger("next");

let canvas = document.createElement("canvas");
let presentationFormat = null;
let device = null;
let context = null;
let pipeline = null;
let mgpu = {};

/* minimalcore:start */
canvas = canvas || document.body;
canvas.classList.add("cablescontext");
canvas.dataset.contextname = "minigpu";
canvas.dataset.api = "webgpu";

if (!op.patch.config.containerElement) console.error("patch options need containerElement for minigpu");

let fpsTime = 0;
let frames = 0;

/* minimalcore:end */

navigator.gpu.requestAdapter(
    {
        "featureLevel": "compatibility"
    }).then(
    (adapter) =>
    {
        adapter.requestDevice(
            {
                "requiredLimits":
            {
                "maxStorageBuffersInVertexStage": 5 // request up to what's supported
            }
            }).then(
            (_device) =>
            {
                device = _device;
                op.patch.config.containerElement.appendChild(canvas);
                canvas.style.width = "100%";
                canvas.style.height = "100%";

                context = canvas.getContext("webgpu");
                const devicePixelRatio = window.devicePixelRatio;
                canvas.width = canvas.clientWidth * devicePixelRatio;
                canvas.height = canvas.clientHeight * devicePixelRatio;
                presentationFormat = navigator.gpu.getPreferredCanvasFormat();

                context.configure(
                    {
                        "device": device,
                        "format": presentationFormat
                    });

                requestAnimationFrame(frame);
            });
    });

function frame(timestamp)
{

    requestAnimationFrame(frame);

    /* minimalcore:start */
    const timeStart = performance.now();

    /* minimalcore:end */

    const commandEncoder = device.createCommandEncoder();
    const textureView = context.getCurrentTexture().createView();

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

    op.patch.frameStore.mgpu = mgpu;
    const rt = new MGPU.RenderTarget(mgpu, { "label": "canvasRt", "view": context.getCurrentTexture().createView() });

    rt.start();
    next.trigger();
    rt.end();

    device.queue.submit([commandEncoder.finish()]);

    /* minimalcore:start */

    mgpu.target.checkEmpty();
    mgpu.shader.checkEmpty();

    canvas.dataset.perfms = Math.round((performance.now() - timeStart) * 100) / 100;
    frames++;
    if (performance.now() - fpsTime > 1000)
    {
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
