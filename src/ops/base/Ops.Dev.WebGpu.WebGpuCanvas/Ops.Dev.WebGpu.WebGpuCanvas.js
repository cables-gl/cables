const
    next = op.outTrigger("Next"),
    supported = op.outBoolNum("Supported", false),
    outLimits = op.outObject("Limits");

let device = null;
let context = null, pipeline = null;

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
canvas.id = "webgpucanvas";
canvas.style.width = 128 + "px";
canvas.style.height = 128 + "px";
canvas.style.right = 0 + "px";
canvas.style["z-index"] = "22222";
canvas.style.border = "1px solid red";
canvas.style.position = "absolute";

console.log(op.patch.cgp);
op.patch.cgp = op.patch.cgp || new CABLES.CGP.Context();
console.log(op.patch.cgp);
const cgp = op.patch.cgp;
let stopped = false;
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
    op.setUiError("nowebgpu", warn);
    console.log(warn);
}

if (navigator.gpu)
    navigator.gpu.requestAdapter().then((adapter) =>
    {
        adapter.requestDevice().then((_device) =>
        {
            cgp.setCanvas(canvas);
            cgp.setSize(512, 256);

            supported.set(true);
            device = _device;

            //

            const limits = {};
            for (let i in device.limits) limits[i] = device.limits[i];
            outLimits.set(limits);

            //

            cgp.device = device;
            cgp.adapter = adapter;
            cgp.canvas = canvas;

            console.log(adapter);
            console.log(device);

            context = canvas.getContext("webgpu");
            cgp.context = context;

            const devicePixelRatio = window.devicePixelRatio || 1;
            const presentationSize = [
                canvas.clientWidth * devicePixelRatio,
                canvas.clientHeight * devicePixelRatio,
            ];

            console.log("presentationSize", presentationSize);
            const presentationFormat = navigator.gpu.getPreferredCanvasFormat(adapter);
            cgp.presentationFormat = presentationFormat;

            context.configure({
                device,
                "format": presentationFormat
            });

            pipeline = device.createRenderPipeline({
                "layout": "auto",
                "vertex":
                {
                    "module": device.createShaderModule(
                        {
                            "code": attachments.tri_wgsl_vert,
                        }),
                    "entryPoint": "main",
                },
                "fragment":
                {
                    "module": device.createShaderModule(
                        {
                            "code": attachments.tri_wgsl_frag,
                        }),
                    "entryPoint": "main",
                    "targets":
                    [
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
    if (stopped) return;
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
                "cleaeValue": { "r": 0.8, "g": 0.2, "b": 0.8, "a": 1.0 },
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

    if (!stopped)requestAnimationFrame(frame);
}
