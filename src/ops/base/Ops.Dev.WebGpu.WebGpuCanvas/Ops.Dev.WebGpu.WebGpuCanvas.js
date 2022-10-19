const
    next = op.outTrigger("Next"),
    supported = op.outBoolNum("Supported", false),
    outLimits = op.outObject("Limits");

let device = null;
let context = null, pipeline = null;

const canvas = document.createElement("canvas");
canvas.id = "webgpucanvas";
canvas.setAttribute("tabindex", 4);
canvas.style.width = 128 + "px";
canvas.style.height = 128 + "px";
canvas.style.right = 0 + "px";
canvas.style["z-index"] = "22222";
canvas.style.border = "1px solid red";
canvas.style.position = "absolute";

const container = document.getElementById("cablescanvas");
container.appendChild(canvas);

canvas.addEventListener("blur", () => { if (supported.get())canvas.style.border = "1px solid black"; });
canvas.addEventListener("focus", () => { if (supported.get())canvas.style.border = "1px solid white"; });

const pm = mat4.create();

let depthTexture = null;
let canvasInfo = {};

op.patch.cgp = op.patch.cgp || new CABLES.CGP.Context();

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
        if (!adapter)
        {
            op.warn("webgpu: could not get adapter...");
            supported.set(false);
            return;
        }
        adapter.requestDevice().then((_device) =>
        {
            canvas.style.border = "1px solid black";

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

            // pipeline = device.createRenderPipeline({
            //     "layout": "auto",
            //     "vertex":
            //     {
            //         "module": device.createShaderModule(
            //             {
            //                 "code": attachments.tri_wgsl_vert,
            //             }),
            //         "entryPoint": "main",
            //     },
            //     "fragment":
            //     {
            //         "module": device.createShaderModule(
            //             {
            //                 "code": attachments.tri_wgsl_frag,
            //             }),
            //         "entryPoint": "main",
            //         "targets":
            //         [
            //             {
            //                 "format": presentationFormat,
            //             },
            //         ],
            //     },
            //     "primitive": {
            //         "topology": "triangle-list",
            //     },
            // });
            // cgp.pipeline = pipeline;

            const sampleCount = 1;
            const newDepthTexture = device.createTexture({
                "size": [presentationSize[0], presentationSize[1]],
                "format": "depth24plus",
                "sampleCount": sampleCount,
                "usage": GPUTextureUsage.RENDER_ATTACHMENT,
            });
            depthTexture = newDepthTexture;
            // canvasInfo.depthTextureView = depthTexture.createView();
            cgp.canvasInfo = canvasInfo;

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

    // mat4.perspective(cgp.pMatrix, 45, canvas.clientWidth / canvas.clientHeight, 0.1, 1110.0);
    // mat4.copy(cgp.pMatrix, pm);

    const commandEncoder = device.createCommandEncoder();
    cgp.textureView = context.getCurrentTexture().createView();

    cgp.canvasInfo.depthTextureView = depthTexture.createView();

    // cgp.textureView = textureView;
    const renderPassDescriptor = {
        "colorAttachments": [
            {
                "view": cgp.textureView,
                "loadOp": "clear",
                // "cleaarValue": { "r": 0.8, "g": 0.2, "b": 0.8, "a": 1.0 },
                "storeOp": "store",
            },
        ],
        "depthStencilAttachment": {
            "view": cgp.canvasInfo.depthTextureView,
            // "depthTexture": cgp.canvasInfo.depthTexture,

            "depthClearValue": 1,
            "depthLoadOp": "clear",
            "depthStoreOp": "store",
        },
    };
    cgp.renderPassDescriptor = renderPassDescriptor;
    cgp.passEncoder = commandEncoder.beginRenderPass(cgp.renderPassDescriptor);

    op.patch.cg = cgp;
    // cgp.passEncoders = [];
    cgp.renderStart();

    const oldCgl = op.patch.cgl;
    op.patch.cgl = null; // force crash if something tries to use it
    next.trigger();

    op.patch.cgl = oldCgl;

    cgp.renderEnd();

    // for(let i=0;i<cgp.passEncoders.length;i++)

    op.patch.cg = null;

    //     const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
    //     passEncoder.setPipeline(pipeline);
    //     passEncoder.draw(3, 1, 0, 0);
    cgp.passEncoder.end();

    const passEncoders = [commandEncoder.finish()];
    // device.queue.submit([commandEncoder.finish()]);

    cgp.device.queue.submit(passEncoders);

    if (!stopped)requestAnimationFrame(frame);
}
