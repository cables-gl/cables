const
    next = op.outTrigger("next");

const canvas = document.createElement("canvas");
/* minimalcore:start */
canvas.classList.add("cablescontext");
canvas.dataset.contextname = "minigpu";
canvas.dataset.api = "webgpu";

/* minimalcore:end */

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
                // quitIfWebGPUNotAvailable(adapter, device);
                document.getElementById("cablescanvas").appendChild(canvas);
                canvas.style.width = "100%";
                canvas.style.height = "100%";

                context = canvas.getContext("webgpu");

                const devicePixelRatio = window.devicePixelRatio;
                canvas.width = canvas.clientWidth * devicePixelRatio;
                canvas.height = canvas.clientHeight * devicePixelRatio;
                const presentationFormat = navigator.gpu.getPreferredCanvasFormat();

                context.configure({
                    device,
                    "format": presentationFormat,
                });
                op.patch.frameStore.minigpu =
                {
                    "device": device,
                    "presentationFormat": presentationFormat

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
    op.patch.frameStore.minigpu.passEncoder = passEncoder;

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
/* minimalcore:edn */
