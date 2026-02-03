const
    next = op.outTrigger("next");
let canvas = document.createElement("canvas");

/* minimalcore:start */
canvas = canvas || document.body;
canvas.classList.add("cablescontext");
canvas.dataset.contextname = "minigpu";
canvas.dataset.api = "webgpu";

if (!op.patch.config.containerElement)console.error("patch options need containerElement for minigpu");

/* minimalcore:end */

let presentationFormat = null;
let device = null;
let context = null;
let pipeline = null;

navigator.gpu.requestAdapter(
    {
        "featureLevel": "compatibility",
    }).then(
    (adapter) =>
    {
        adapter.requestDevice().then(
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

                context.configure({
                    device,
                    "format": presentationFormat,
                });
                op.patch.frameStore.mgpu =
                {
                    "device": device,
                    "format": presentationFormat

                };

                requestAnimationFrame(frame);
            });
    });

function frame()
{
    const commandEncoder = device.createCommandEncoder();
    const textureView = context.getCurrentTexture().createView();

    const renderPassDescriptor = {
        "colorAttachments": [
            {
                "view": textureView,
                "clearValue": [0, 0, 0, 1], // Clear to transparent
                "loadOp": "clear",
                "storeOp": "store",
            },
        ],
    };
    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);

    if (!presentationFormat) return;
    op.patch.frameStore.mgpu = {
        "shader": new CABLES.Stack(),
        "passEncoder": passEncoder,
        "device": device,
        "format": presentationFormat };

    next.trigger();

    passEncoder.end();

    device.queue.submit([commandEncoder.finish()]);

    requestAnimationFrame(frame);
}

/* minimalcore:start */
op.onDelete = () =>
{
    canvas.remove();
};

/* minimalcore:end */
