let device = null;
let context = null, pipeline = null;
// const canvas=ele.byId("glcanvas");
const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
canvas.id = "webgpucanvas";
canvas.style.width = 300 + "px";
canvas.style.height = 200 + "px";
canvas.style.right = 1 + "px";
canvas.style["z-index"] = "22222";
canvas.style.border = "3px solid red";
canvas.style.position = "absolute";

if (!navigator.gpu)
{
    const warn = "Your browser does not support webGPU";
    op.setUiError("nowebgpu", warn);
    console.log(warn);
}

if (navigator.gpu)
    navigator.gpu.requestAdapter().then((adapter) =>
    {
        adapter.requestDevice().then((_device) =>
        {
            device = _device;
            console.log(adapter);
            console.log(device);

            //   if (canvas.current === null) return;
            context = canvas.getContext("webgpu");

            const devicePixelRatio = window.devicePixelRatio || 1;
            const presentationSize = [
                canvas.clientWidth * devicePixelRatio,
                canvas.clientHeight * devicePixelRatio,
            ];
            const presentationFormat = context.getPreferredFormat(adapter);

            context.configure({
                device,
                "format": presentationFormat,
                "size": presentationSize,
            });

            pipeline = device.createRenderPipeline({
                "vertex": {
                    "module": device.createShaderModule({
                        "code": attachments.tri_wgsl_vert,
                    }),
                    "entryPoint": "main",
                },
                "fragment": {
                    "module": device.createShaderModule({
                        "code": attachments.tri_wgsl_frag,
                    }),
                    "entryPoint": "main",
                    "targets": [
                        {
                            "format": presentationFormat,
                        },
                    ],
                },
                "primitive": {
                    "topology": "triangle-list",
                },
            });

            requestAnimationFrame(frame);
        });
    });

function frame()
{
    if (!device)
    {
        requestAnimationFrame(frame);

        return;
    }

    const commandEncoder = device.createCommandEncoder();
    const textureView = context.getCurrentTexture().createView();

    const renderPassDescriptor = {
        "colorAttachments": [
            {
                "view": textureView,
                "loadValue": { "r": 0.0, "g": 0.0, "b": 0.0, "a": 1.0 },
                "storeOp": "store",
            },
        ],
    };

    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
    passEncoder.setPipeline(pipeline);
    passEncoder.draw(3, 1, 0, 0);
    passEncoder.endPass();

    device.queue.submit([commandEncoder.finish()]);
    requestAnimationFrame(frame);
}
