// !! https://alain.xyz/blog/raw-webgpu
// https://github.com/gfxfundamentals/webgpufundamentals/blob/main/webgpu/webgpu-cube.html

const
    inTrigger = op.inTrigger("Render"),
    inGeom = op.inObject("Geometry", null, "geometry"),
    next = op.outTrigger("Next");

const cgp = op.patch.cgp;
let needsbuild = true;

let bindGroup;
let positionBuffer;
let normalBuffer;
let texcoordBuffer;
let indicesBuffer;
let geom = null;
let pipeline;
let renderPassDescriptor;

inTrigger.onTriggered = () =>
{
    if (needsbuild)rebuild();

    if (geom)
    {
        const colorTexture = cgp.context.getCurrentTexture();
        renderPassDescriptor.colorAttachments[0].view = colorTexture.createView();

        const commandEncoder = cgp.device.createCommandEncoder();
        const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);

        passEncoder.setPipeline(pipeline);
        // passEncoder.setBindGroup(0, bindGroup);
        passEncoder.setVertexBuffer(0, positionBuffer);
        passEncoder.setVertexBuffer(1, normalBuffer);
        passEncoder.setVertexBuffer(2, texcoordBuffer);
        passEncoder.setIndexBuffer(indicesBuffer, "uint16");
        passEncoder.drawIndexed(geom.verticesIndices.length);
        passEncoder.end();
        cgp.device.queue.submit([commandEncoder.finish()]);
    }

    next.trigger();
};

inGeom.onChange = () =>
{
    needsbuild = true;
};

const shaderSrc = `
  struct VSUniforms {
    worldViewProjection: mat4x4<f32>,
    worldInverseTranspose: mat4x4<f32>,
  };

  //@group(0) @binding(0) var<uniform> vsUniforms: VSUniforms;

  struct MyVSInput {
      @location(0) position: vec3<f32>,
      @location(1) normal: vec3<f32>,
      @location(2) texcoord: vec2<f32>,
  };

  struct MyVSOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) normal: vec3<f32>,
    @location(1) texcoord: vec2<f32>,
  };

  @vertex
  fn myVSMain(v: MyVSInput) -> MyVSOutput {
    var vsOut: MyVSOutput;
    vsOut.position =vec4<f32>(v.position, 1.0);// vsUniforms.worldViewProjection * v.position;
    //vsOut.normal = (vsUniforms.worldInverseTranspose * vec4<f32>(v.normal, 0.0)).xyz;
    //vsOut.texcoord = v.texcoord;
    return vsOut;
  }

  struct FSUniforms {
    lightDirection: vec3<f32>,
  };

  //@group(0) @binding(1) var<uniform> fsUniforms: FSUniforms;

  @fragment
  fn myFSMain(v: MyVSOutput) -> @location(0) vec4<f32> {
    // var diffuseColor = textureSample(diffuseTexture, diffuseSampler, v.texcoord);
    // var a_normal = normalize(v.normal);
    // var l = dot(a_normal, fsUniforms.lightDirection) * 0.5 + 0.5;
    // return vec4<f32>(diffuseColor.rgb * l, diffuseColor.a);
    return vec4<f32>(1.0, 1.0, 0.0, 1.0);
  }
  `;

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
    console.log("createbuffer", data.byteLength, usage, data);
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
    console.log(geom);

    positionBuffer = createBuffer(cgp.device, new Float32Array(geom.vertices), GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST);
    normalBuffer = createBuffer(cgp.device, new Float32Array(geom.vertexNormals), GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST);
    texcoordBuffer = createBuffer(cgp.device, new Float32Array(geom.texcoords), GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST);
    console.log(geom.verticesIndices);

    indicesBuffer = createBuffer(cgp.device, new Uint32Array(geom.verticesIndices), GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST);

    const projection = mat4.create();
    const camera = mat4.create();
    const view = mat4.create();
    const viewProjection = mat4.create();

    mat4.perspective(projection, 30 * Math.PI / 180, cgp.canvas.clientWidth / cgp.canvas.clientHeight, 0.5, 10);
    const eye = [1, 4, -6];
    const target = [0, 0, 0];
    const up = [0, 1, 0];

    mat4.lookAt(camera, eye, target, up);
    mat4.invert(view, camera);

    mat4.multiply(viewProjection, projection, view);

    const shaderModule = createShaderModule(cgp.device, shaderSrc);

    cgp.device.pushErrorScope("validation");
    pipeline = cgp.device.createRenderPipeline({
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
            "cullMode": "back",
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
    });
    const error = cgp.device.popErrorScope().then((error) =>
    {
        console.log(error);
    });
    //   if (error) {
    //     throw new Error('failed to create pipeline');
    //   }

    const vUniformBufferSize = 2 * 16 * 4; // 2 mat4s * 16 floats per mat * 4 bytes per float
    const fUniformBufferSize = 3 * 4; // 1 vec3 * 3 floats per vec3 * 4 bytes per float

    const vsUniformBuffer = cgp.device.createBuffer({
        "size": vUniformBufferSize,
        "usage": GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    const fsUniformBuffer = cgp.device.createBuffer({
        "size": fUniformBufferSize,
        "usage": GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    const vsUniformValues = new Float32Array(2 * 16); // 2 mat4s
    const worldViewProjection = vsUniformValues.subarray(0, 16);
    const worldInverseTranspose = vsUniformValues.subarray(16, 32);
    const fsUniformValues = new Float32Array(3); // 1 vec3
    const lightDirection = fsUniformValues.subarray(0, 3);

    bindGroup = cgp.device.createBindGroup(
        {
            "layout": pipeline.getBindGroupLayout(0),
            "entries": [
                // { "binding": 0, "resource": { "buffer": vsUniformBuffer } },
                // { "binding": 1, "resource": { "buffer": fsUniformBuffer } }
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
        vsUniformValues.byteLength,
    );
    cgp.device.queue.writeBuffer(
        fsUniformBuffer,
        0,
        fsUniformValues.buffer,
        fsUniformValues.byteOffset,
        fsUniformValues.byteLength,
    );

    // const textureView = context.getCurrentTexture().createView();
    // cgp.textureView = textureView;

    const textureView = cgp.context.getCurrentTexture().createView();

    renderPassDescriptor = {
        "colorAttachments": [
            {
                "view": cgp.textureView, // Assigned later
                // resolveTarget: undefined, // Assigned Later
                "clearValue": { "r": 0.1, "g": 0.5, "b": 0.5, "a": 1.0 },
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
