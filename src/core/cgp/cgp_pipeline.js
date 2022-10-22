
export default class Pipeline
{
    constructor(_cgp, _name)
    {
        if (!_cgp) throw new Error("Pipeline constructed without cgp " + _name);
        this._cgp = _cgp;


        this._pipeCfg = null;
        this._renderPipeline = null;

        this._fsUniformBuffer = null;
        this._vsUniformBuffer = null;

        this._old = {};
    }

    setPipeline(shader, mesh)
    {
        if (!mesh || !shader)
        {
            console.log("pipeline unknown shader/mesh");
            return;
        }

        const needsRebuild =
            !this._renderPipeline ||
            !this._pipeCfg ||
            this._old.mesh != mesh ||
            this._old.shader != shader ||
            mesh.needsPipelineUpdate ||
            shader.needsPipelineUpdate;


        if (needsRebuild)
        {
            this._old.shader = shader;
            this._old.mesh = mesh;

            this._pipeCfg = this.getPiplelineObject(shader, mesh);
            console.log(this._pipeCfg);
            this._renderPipeline = this._cgp.device.createRenderPipeline(this._pipeCfg);

            this._bindUniforms(shader);
        }

        if (this._renderPipeline)
        {
            mat4.copy(this._matModel, this._cgp.mMatrix);
            mat4.copy(this._matView, this._cgp.vMatrix);
            mat4.copy(this._matProj, this._cgp.pMatrix);

            this._cgp.device.queue.writeBuffer(
                this._vsUniformBuffer,
                0,
                this._vsUniformValues.buffer,
                this._vsUniformValues.byteOffset,
                this._vsUniformValues.byteLength
            );

            this.updateFragUniforms(shader);

            this._cgp.passEncoder.setPipeline(this._renderPipeline);
            this._cgp.passEncoder.setBindGroup(0, this._bindGroup);
            // this._pipeline = this._cgp.device.createRenderPipeline(this._pipeCfg);
        }
    }

    getPiplelineObject(shader, mesh)
    {
        const pipeCfg = {
            "layout": "auto",
            "vertex": {
                "module": shader.shaderModule,
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
                "module": shader.shaderModule,
                "entryPoint": "myFSMain",
                "targets": [
                    { "format": this._cgp.presentationFormat },
                ],
            },
            "primitive": {
                "topology": "triangle-list",
                "cullMode": "none", // back/none/front

                // "point-list",
                // "line-list",
                // "line-strip",
                // "triangle-list",
                // "triangle-strip"
            },
            "depthStencil": {
                "depthWriteEnabled": true,
                "depthCompare": "less",
                "format": "depth24plus",
            },

        };

        return pipeCfg;
    }


    _bindUniforms(shader)
    {
        this._cgp.device.popErrorScope().then((error) =>
        {
            if (error)console.log("error", error);
        });


        const counts = { };


        for (let i = 0; i < shader.uniforms.length; i++)
        {
            const uni = shader.uniforms[i];
            const type = uni.shaderType;
            counts[type] = counts[type] || 0;


            counts[type] += uni.getSizeBytes();
        }
        console.log(counts, counts.frag);


        const vUniformBufferSize = 3 * 16 * 4; // 2 mat4s * 16 floats per mat * 4 bytes per float
        const fUniformBufferSize = counts.frag;// 2 * 3 * 4; // 1 vec3 * 3 floats per vec3 * 4 bytes per float

        this._vsUniformBuffer = this._cgp.device.createBuffer({
            "size": vUniformBufferSize,
            "usage": GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        this._fsUniformBuffer = this._cgp.device.createBuffer({
            "size": fUniformBufferSize,
            "usage": GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        this._vsUniformValues = new Float32Array(vUniformBufferSize / 4);
        this._fsUniformValues = new Float32Array(counts.frag / 4);

        this._matModel = this._vsUniformValues.subarray(0, 16);
        this._matView = this._vsUniformValues.subarray(16, 32);
        this._matProj = this._vsUniformValues.subarray(32, 48);


        // this._fsUniformValues[1] = 1.0;
        // this._fsUniformValues[0] = 1.0;
        // const lightDirection = this._fsUniformValues.subarray(0, 3);

        // console.log("pipeline bindgrouplayout ", pipeline.getBindGroupLayout(0));

        this._bindGroup = this._cgp.device.createBindGroup(
            {
                "layout": this._renderPipeline.getBindGroupLayout(0),
                "entries": [
                    { "binding": 0, "resource": { "buffer": this._vsUniformBuffer } },
                    { "binding": 1, "resource": { "buffer": this._fsUniformBuffer } }
                    //   { binding: 2, resource: sampler },
                    //   { binding: 3, resource: tex.createView() },
                ],
            });

        this._cgp.device.queue.writeBuffer(
            this._vsUniformBuffer,
            0,
            this._vsUniformValues.buffer,
            this._vsUniformValues.byteOffset,
            this._vsUniformValues.byteLength
        );

        this.updateFragUniforms(shader);
        this._cgp.device.popErrorScope().then((error) =>
        {
            if (error)console.log("error", error);
        });
    }


    updateFragUniforms(shader)
    {
        let count = 0;
        for (let i = 0; i < shader.uniforms.length; i++)
        {
            const uni = shader.uniforms[i];
            if (uni.shaderType == "frag")
            {
                if (uni.getSizeBytes() / 4 > 1)
                {
                    for (let j = 0; j < uni.getValue().length; j++)
                    {
                        this._fsUniformValues[count] = uni.getValue()[j];
                        count++;
                    }
                }
                else
                {
                    // single value
                    console.log("single value?!?!?");
                }
            }

            count += uni.getSizeBytes() / 4;
        }


        this._cgp.device.queue.writeBuffer(
            this._fsUniformBuffer,
            0,
            this._fsUniformValues.buffer,
            this._fsUniformValues.byteOffset,
            this._fsUniformValues.byteLength
        );
    }
}
