const next = op.outTrigger("Next");

let device = null;
let context = null, pipeline = null;

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
canvas.id = "webgpucanvas";
canvas.style.width = 515 + "px";
canvas.style.height = 300 + "px";
canvas.style.right = 1 + "px";
canvas.style["z-index"] = "22222";
canvas.style.border = "3px solid red";
canvas.style.position = "absolute";

const cgp = op.patch.cgp;

op.onDelete = () =>
{
    canvas.remove();
};

if (!navigator.gpu)
{
    const warn = "Your browser does not support webGPU";
    op.setUiError("nowebgpu", warn);
    console.log(warn); s;
}

if (navigator.gpu)
    navigator.gpu.requestAdapter().then((adapter) =>
    {
        adapter.requestDevice().then((_device) =>
        {
            device = _device;

            op.patch.cgp.device = device;
            op.patch.cgp.adapter = adapter;
            op.patch.cgp.canvas = canvas;

            console.log(adapter);
            console.log(device);

            context = canvas.getContext("webgpu");
            cgp.context = context;

            const devicePixelRatio = window.devicePixelRatio || 1;
            const presentationSize = [
                canvas.clientWidth * devicePixelRatio,
                canvas.clientHeight * devicePixelRatio,
            ];
            const presentationFormat = navigator.gpu.getPreferredCanvasFormat(adapter);
            cgp.presentationFormat = presentationFormat;

            context.configure({
                device,
                "format": presentationFormat,
                // "size": presentationSize,
            });

            pipeline = device.createRenderPipeline({
                "layout": "auto",

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
            cgp.pipeline = pipeline;

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
    cgp.textureView = context.getCurrentTexture().createView();
    // cgp.textureView = textureView;
    const renderPassDescriptor = {
        "colorAttachments": [
            {
                "view": cgp.textureView,
                "loadOp": "clear",
<<<<<<< HEAD
                "cleaeValue": { "r": 0.8, "g": 0.2, "b": 0.8, "a": 1.0 },
=======
                "clearValue": { "r": 0.0, "g": 0.5, "b": 0.0, "a": 1.0 },
>>>>>>> 7b7861ff3a4e584f1d1590295fdd6bcdaa193097
                "storeOp": "store",
            },
        ],
    };
    cgp.renderPassDescriptor = renderPassDescriptor;

    next.trigger();

    // const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
    // passEncoder.setPipeline(pipeline);
    // passEncoder.draw(3, 1, 0, 0);
    // passEncoder.end();

    // device.queue.submit([commandEncoder.finish()]);

    requestAnimationFrame(frame);
}
