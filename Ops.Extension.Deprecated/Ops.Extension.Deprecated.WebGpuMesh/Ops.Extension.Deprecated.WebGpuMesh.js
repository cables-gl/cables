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

let depthTexture, depthTextureView;

let vsUniformBuffer;
let fsUniformBuffer;
let vsUniformValues;
let fsUniformValues;
let matModel;
let matView;
let matProj;

let mesh = null;
let shader = null;
let pipe = null;

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

        // const colorTexture = cgp.context.getCurrentTexture();
        // renderPassDescriptor.colorAttachments[0].view = colorTexture.createView();

        // const commandEncoder = cgp.device.createCommandEncoder();
        // const passEncoder = commandEncoder.beginRenderPass(cgp.renderPassDescriptor);

        // cgp.passEncoder.setPipeline(pipeline);
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

    cgp.pushShader(shader);
    next.trigger();
    cgp.popShader();
};

inGeom.onChange = () =>
{
    needsbuild = true;
};

//   @group(0) @binding(2) var diffuseSampler: sampler;
//   @group(0) @binding(3) var diffuseTexture: texture_2d<f32>;

function createShaderModule(device, code)
{
    cgp.pushErrorScope("webgpumesh");

    const shaderModule = device.createShaderModule({ code });
    // const error = await device.popErrorScope();
    // if (error) {
    //   throw new Error(error.message);
    // }

    cgp.popErrorScope();

    return shaderModule;
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

    if (!shader)shader = new CGP.Shader(cgp, "testshad0r");

    shader.shaderModule = createShaderModule(cgp.device, attachments.mesh_wgsl);

    cgp.pushErrorScope("webgpumesh");

    if (!pipe)pipe = new CGP.Pipeline(cgp);

    const pipeCfg = pipe.getPiplelineObject(shader, mesh);
    console.log(pipeCfg);
    pipeline = cgp.device.createRenderPipeline(pipeCfg);

    cgp.popErrorScope(op.name);

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

    // console.log("pipeline bindgrouplayout ", pipeline.getBindGroupLayout(0));

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

    const textureView = cgp.context.getCurrentTexture().createView();

    needsbuild = false;
}
