// !! https://alain.xyz/blog/raw-webgpu
// https://github.com/gfxfundamentals/webgpufundamentals/blob/main/webgpu/webgpu-cube.html

const
    inTrigger = op.inTrigger("Render"),
    inGeom = op.inObject("Geometry", null, "geometry"),
    next = op.outTrigger("Next");

let cgp = op.patch.cgp;
let needsbuild = true;

let bindGroup;
let positionBuffer;
let normalBuffer;
let texcoordBuffer;
let indicesBuffer;
let geom = null;
let pipeline;
let renderPassDescriptor;
let numIndices = 0;

let vsUniformBuffer;
let fsUniformBuffer;
let vsUniformValues;
let fsUniformValues;
let matModel;
let matView;
let matProj;

inTrigger.onTriggered = () =>
{
    cgp = op.patch.cgp;
    if (needsbuild)rebuild();

    if (geom && cgp.renderPassDescriptor)
    {
        mat4.copy(matModel, cgp.mMatrix);
        mat4.copy(matView, cgp.vMatrix);
        mat4.copy(matProj, cgp.pMatrix);

        cgp.device.queue.writeBuffer(
            vsUniformBuffer,
            0,
            vsUniformValues.buffer,
            vsUniformValues.byteOffset,
            vsUniformValues.byteLength
        );

        const colorTexture = cgp.context.getCurrentTexture();
        // renderPassDescriptor.colorAttachments[0].view = colorTexture.createView();

        // const commandEncoder = cgp.device.createCommandEncoder();
        // const passEncoder = commandEncoder.beginRenderPass(cgp.renderPassDescriptor);

        cgp.passEncoder.setPipeline(pipeline);
        cgp.passEncoder.setBindGroup(0, bindGroup);
        cgp.passEncoder.setVertexBuffer(0, positionBuffer);
        cgp.passEncoder.setVertexBuffer(1, normalBuffer);
        cgp.passEncoder.setVertexBuffer(2, texcoordBuffer);
        cgp.passEncoder.setIndexBuffer(indicesBuffer, "uint32");

        cgp.passEncoder.drawIndexed(numIndices);
        // else cgp.passEncoder.draw(geom.vertices.length );

        // passEncoder.end();

        // cgp.passEncoders.push(commandEncoder.finish());
    }

    next.trigger();
};

inGeom.onChange = () =>
{
    needsbuild = true;
};

//   @group(0) @binding(2) var diffuseSampler: sampler;
//   @group(0) @binding(3) var diffuseTexture: texture_2d<f32>;

function createShaderModule(device, code)
{
    device.pushErrorScope("validation");
    const shader = device.createShaderModule({ code });
    // const error = await device.popErrorScope();
    // if (error) {
    //   throw new Error(error.message);
    // }

    const error = cgp.device.popErrorScope().then((error) =>
    {
        console.log(error);
    });

    return shader;
}

function createBuffer(device, data, usage)
{
    const buffer = device.createBuffer({
        "size": data.byteLength,
        "usage": usage,
        "mappedAtCreation": true,
    });
    const dst = new data.constructor(buffer.getMappedRange());
    dst.set(data);
    buffer.unmap();
    return buffer;
}

function rebuild()
{
    geom = inGeom.get();
    if (!geom) return;

    positionBuffer = createBuffer(cgp.device, new Float32Array(geom.vertices), GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST);
    normalBuffer = createBuffer(cgp.device, new Float32Array(geom.vertexNormals), GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST);
    texcoordBuffer = createBuffer(cgp.device, new Float32Array(geom.texcoords), GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST);

    let vi = geom.verticesIndices;
    if (!geom.isIndexed())
    {
        vi = Array.from(Array(geom.vertices.length / 3).keys());
    }

    numIndices = vi.length;
    indicesBuffer = createBuffer(cgp.device, new Uint32Array(vi), GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST);

    const shaderModule = createShaderModule(cgp.device, attachments.mesh_wgsl);

    cgp.device.pushErrorScope("validation");

    console.log(geom.vertices.length / 3);

    const pipelineCfg = {
        "layout": "auto",
        "vertex": {
            "module": shaderModule,
            "entryPoint": "myVSMain",
            "buffers": [
                // position
                {
                    "arrayStride": 3 * 4, // 3 floats, 4 bytes each
                    "attributes": [
                        { "shaderLocation": 0, "offset": 0, "format": "float32x3" },
                    ],
                },
                // normals
                {
                    "arrayStride": 3 * 4, // 3 floats, 4 bytes each
                    "attributes": [
                        { "shaderLocation": 1, "offset": 0, "format": "float32x3" },
                    ],
                },
                // texcoords
                {
                    "arrayStride": 2 * 4, // 2 floats, 4 bytes each
                    "attributes": [
                        { "shaderLocation": 2, "offset": 0, "format": "float32x2", },
                    ],
                },
            ],
        },
        "fragment": {
            "module": shaderModule,
            "entryPoint": "myFSMain",
            "targets": [
                { "format": cgp.presentationFormat },
            ],
        },
        "primitive": {
            "topology": "triangle-list",
            "cullMode": "none",

            // "point-list",
            // "line-list",
            // "line-strip",
            // "triangle-list",
            // "triangle-strip"
        },
        // "depthStencil": {
        //     "depthWriteEnabled": true,
        //     "depthCompare": "less",
        //     "format": "depth24plus",
        // },
    // ...(canvasInfo.sampleCount > 1 && {
    //     multisample: {
    //       count: canvasInfo.sampleCount,
    //     },
    // }),
    };

    pipeline = cgp.device.createRenderPipeline(pipelineCfg);
    const error = cgp.device.popErrorScope().then((error) =>
    {
        console.log("error", error);
    });
        //   if (error) {
        //     throw new Error('failed to create pipeline');
        //   }

    const vUniformBufferSize = 3 * 16 * 4; // 2 mat4s * 16 floats per mat * 4 bytes per float
    const fUniformBufferSize = 2 * 3 * 4; // 1 vec3 * 3 floats per vec3 * 4 bytes per float

    vsUniformBuffer = cgp.device.createBuffer({
        "size": vUniformBufferSize,
        "usage": GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    fsUniformBuffer = cgp.device.createBuffer({
        "size": fUniformBufferSize,
        "usage": GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    vsUniformValues = new Float32Array(vUniformBufferSize / 4);
    fsUniformValues = new Float32Array(fUniformBufferSize / 4);

    matModel = vsUniformValues.subarray(0, 16);
    matView = vsUniformValues.subarray(16, 32);
    matProj = vsUniformValues.subarray(32, 48);

    fsUniformValues[1] = 1.0;
    fsUniformValues[0] = 1.0;
    const lightDirection = fsUniformValues.subarray(0, 3);

    console.log("pipeline bindgrouplayout ", pipeline.getBindGroupLayout(0));

    bindGroup = cgp.device.createBindGroup(
        {
            "layout": pipeline.getBindGroupLayout(0),
            "entries": [
                { "binding": 0, "resource": { "buffer": vsUniformBuffer } },
                { "binding": 1, "resource": { "buffer": fsUniformBuffer } }
                //   { binding: 2, resource: sampler },
                //   { binding: 3, resource: tex.createView() },
            ],
        });

    // const world = mat4.rotationY(time);
    // mat4.transpose(mat4.inverse(world), worldInverseTranspose);
    // mat4.multiply(viewProjection, world, worldViewProjection);

    // vec3.normalize([1, 8, -10], lightDirection);
    cgp.device.queue.writeBuffer(
        vsUniformBuffer,
        0,
        vsUniformValues.buffer,
        vsUniformValues.byteOffset,
        vsUniformValues.byteLength
    );
    cgp.device.queue.writeBuffer(
        fsUniformBuffer,
        0,
        fsUniformValues.buffer,
        fsUniformValues.byteOffset,
        fsUniformValues.byteLength
    );

    // const textureView = context.getCurrentTexture().createView();
    // cgp.textureView = textureView;

    const textureView = cgp.context.getCurrentTexture().createView();

    renderPassDescriptor = {
        "colorAttachments": [
            {
                "view": cgp.textureView, // Assigned later
                // resolveTarget: undefined, // Assigned Later
                // "clearValue": { "r": 0.1, "g": 0.5, "b": 0.5, "a": 1.0 },
                "loadOp": "clear",
                "storeOp": "store",
            },
        ],
        // depthStencilAttachment: {
        //   // view: undefined,  // Assigned later
        //   depthClearValue: 1,
        //   depthLoadOp: 'clear',
        //   depthStoreOp: 'store',
        // },
    };

    // if (canvasInfo.sampleCount === 1) {
    // const colorTexture = context.getCurrentTexture();
    // renderPassDescriptor.colorAttachments[0].view = colorTexture.createView();
    // } else {
    //   renderPassDescriptor.colorAttachments[0].view = canvasInfo.renderTargetView;
    //   renderPassDescriptor.colorAttachments[0].resolveTarget = context.getCurrentTexture().createView();
    // }
    // renderPassDescriptor.depthStencilAttachment.view = canvasInfo.depthTextureView;

    needsbuild = false;
}
