const
    next = op.outTrigger("next");
let canvas = document.createElement("canvas");

/* minimalcore:start */
canvas = canvas || document.body;
canvas.classList.add("cablescontext");
canvas.dataset.contextname = "minigpu";
canvas.dataset.api = "webgpu";

if (!op.patch.config.containerElement) console.error("patch options need containerElement for minigpu");

let fpsTime = 0;
let frames = 0;

/* minimalcore:end */

let presentationFormat = null;
let device = null;
let context = null;
let pipeline = null;

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
                op.patch.frameStore.mgpu = {
                    "device": device,
                    "format": presentationFormat

                };

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

    const renderPassDescriptor = {
        "colorAttachments": [
            {
                "view": textureView,
                "clearValue": [0, 0, 0, 1],
                "loadOp": "clear",
                "storeOp": "store"
            }
        ]
    };
    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);

    if (!presentationFormat) return;
    op.patch.frameStore.mgpu = {
        "matModel": new CABLES.Stack(MGPU.mm.identity()),
        "matView": new CABLES.Stack(MGPU.mm.identity()),
        "matProj": new CABLES.Stack(MGPU.mm.perspective(45 * Math.PI / 180, canvas.clientWidth / canvas.clientHeight, 0.1, 100)),
        "shader": new CABLES.Stack(),
        "passEncoder": passEncoder,
        "commandEncoder": commandEncoder,
        "device": device,
        "format": presentationFormat
    };

    next.trigger();
    // console.log(canvas.clientWidth, canvas.clientHeight); c

    passEncoder.end();

    device.queue.submit([commandEncoder.finish()]);

    /* minimalcore:start */
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
