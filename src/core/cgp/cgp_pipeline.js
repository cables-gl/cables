/// <reference types="@webgpu/types" />
import { Logger } from "cables-shared-client";
import { WebGpuContext } from "./cgp_state.js";
import CgpShader from "./cgp_shader.js";
import CgpMesh from "./cgp_mesh.js";

export default class Pipeline
{
    static DEPTH_COMPARE_FUNCS_STRINGS = ["never", "less", "equal", "lessequal", "greater", "notequal", "greaterequal", "always"];

    static TYPE_RENDER = 0;
    static TYPE_COMPUTE = 1;

    #log = new Logger("pipeline");
    #name = "";
    #cgp = null;
    #isValid = true;

    /** @type {GPURenderPipelineDescriptor|GPUComputePipelineDescriptor} */
    #pipeCfg = null;

    /** @type {GPUComputePipeline|GPURenderPipeline} */
    #renderPipeline = null;

    /** @type {GPUBindGroupLayout} */
    bindGroupLayout = null;

    /** @type {Array<GPUBindGroupEntry>} */
    #bindGroups = [];

    /** @type {Array<GPURenderPassEncoder|GPUComputePassEncoder>} */
    #passEncoder;

    #shaderListeners = [];
    #old = {};
    #errorCount = 0;
    #type = Pipeline.TYPE_RENDER;

    shaderNeedsPipelineUpdate = "";

    /**
     * Description
     * @param {WebGpuContext} _cgp
     * @param {String} name
     * @param {Number} type
     */
    constructor(_cgp, name, type = 0)
    {
        if (!_cgp) throw new Error("Pipeline constructed without cgp " + name);
        this.#name = name;
        this.#cgp = _cgp;
        this.#type = type;

        this.#cgp.on("deviceChange", () =>
        {
            this.#renderPipeline = null;
        });
    }

    get isValid() { return this.#isValid; }

    /**
     * @param {String} name
     */
    setName(name)
    {
        this.#name = name;
    }

    /**
     * @param {CgpShader} oldShader
     * @param {CgpShader} newShader
     */
    setShaderListener(oldShader, newShader)
    {
        for (let i = 0; i < this.#shaderListeners.length; i++) oldShader.off(this.#shaderListeners[i]);

        this.#shaderListeners.push(
            newShader.on("compiled", () =>
            {
                // this._log.log("pipe update shader compileeeeeee");
                // this.needsRebuildReason = "shader changed";
                this.shaderNeedsPipelineUpdate = "shader compiled";
            }));
    }

    getInfo()
    {
        // this._log.log(this.bindingGroupLayoutEntries);

        const arr = [
            "name: " + this.#name,
            "bindgroups: " + this.#bindGroups.length

        ];

        if (this.bindingGroupLayoutEntries)arr.push("layouts: " + this.bindingGroupLayoutEntries.length);

        // if (this.bindingGroupLayoutEntries)
        //     for (let i = 0; i < this.bindingGroupLayoutEntries.length; i++)
        //     {
        //         // const lines = JSON.stringify(this.bindingGroupLayoutEntries, 4, true).split(",");
        //         arr.push(...lines);
        //     }

        return arr;
    }

    /**
     * @param {CgpShader} shader
     * @param {CgpMesh} mesh
     */
    setPipeline(shader, mesh = null,)
    {
        if (this.#type == Pipeline.TYPE_RENDER)
        {
            if (!mesh)
            {
                this.#log.log("pipeline unknown mesh");
                return;

            }

        }
        if (!shader)
        {
            this.#log.log("pipeline unknown shader");
            return;
        }

        if (this.#cgp.frameStore.branchProfiler) this.#cgp.frameStore.branchStack.push("setPipeline", this.getInfo());

        let needsRebuildReason = "";
        if (!this.#renderPipeline) needsRebuildReason = "no renderpipeline";
        if (!this.#pipeCfg)needsRebuildReason = "no pipecfg";
        if (this.#old.mesh != mesh)needsRebuildReason = "no mesh";
        if (this.#old.shader != shader)
        {
            this.setShaderListener(this.#old.shader, shader);
            needsRebuildReason = "shader changed";
        }

        if (shader.needsPipelineUpdate)
        {
            needsRebuildReason = "shader needs update: " + shader.needsPipelineUpdate;
            shader.needsPipelineUpdate = "";
        }

        if (this.#type == Pipeline.TYPE_RENDER && mesh.needsPipelineUpdate)
        {
            needsRebuildReason = "mesh needs update";
            mesh.needsPipelineUpdate = false;
        }
        if (this.shaderNeedsPipelineUpdate)needsRebuildReason = "shader was recompiled: " + this.shaderNeedsPipelineUpdate;

        if (this.#pipeCfg)
        {
            if (this.#type == Pipeline.TYPE_RENDER)
            {
                if (this.#pipeCfg.depthStencil.depthWriteEnabled != this.#cgp.stateDepthWrite())
                {
                    needsRebuildReason = "depth changed";
                    this.#pipeCfg.depthStencil.depthWriteEnabled = !!this.#cgp.stateDepthWrite();
                }

                if (this.#pipeCfg.fragment.targets[0].blend != this.#cgp.stateBlend())
                {
                    needsRebuildReason = "blend changed";
                    this.#pipeCfg.fragment.targets[0].blend = this.#cgp.stateBlend();
                }

                if (this.#cgp.stateDepthTest() === false)
                {
                    if (this.#pipeCfg.depthStencil.depthCompare != "never")
                    {
                        this.#pipeCfg.depthStencil.depthCompare = "never";
                        needsRebuildReason = "depth compare changed";
                    }
                }
                else
                if (this.#pipeCfg.depthStencil.depthCompare != this.#cgp.stateDepthFunc())
                {
                    needsRebuildReason = "depth state ";
                    this.#pipeCfg.depthStencil.depthCompare = this.#cgp.stateDepthFunc();
                }

                if (this.#pipeCfg.primitive.cullMode != this.#cgp.stateCullFaceFacing())
                {
                    needsRebuildReason = "cullmode change";
                    this.#pipeCfg.primitive.cullMode = this.#cgp.stateCullFaceFacing();
                }

            }
        }

        this.#cgp.currentPipeDebug =
        {
            "cfg": this.#pipeCfg,
            "bindingGroupLayoutEntries": this.bindingGroupLayoutEntries
        };
        if (needsRebuildReason != "")
        {
            // console.log("needsRebuildReason");
            console.log("rebuild pipe", needsRebuildReason);
            this.#cgp.pushErrorScope("createPipeline", { "logger": this.#log });

            this.#bindGroups = [];

            this.#pipeCfg = this.getPipelineObject(shader);

            this.#old.device = this.#cgp.device;
            this.#old.shader = shader;
            this.#old.mesh = mesh;

            try
            {

                if (this.#type == Pipeline.TYPE_RENDER) this.#renderPipeline = this.#cgp.device.createRenderPipeline(this.#pipeCfg);
                else if (this.#type == Pipeline.TYPE_COMPUTE) this.#renderPipeline = this.#cgp.device.createComputePipeline(this.#pipeCfg);
                // this.#computePipeline = this._cgp.device.createComputePipeline({
                //     "layout": "auto",
                //     "compute": {
                //         "module": this.gpuShaderModule,
                //         "entryPoint": this.options.entryPoint || "main"
                //     }
                // });

            }
            catch (e)
            {

                console.error("pipe error catch...", e.message, this.#pipeCfg);
                this.#isValid = false;
            }

            this.#cgp.popErrorScope();
        }

        if (this.#renderPipeline && this.#isValid)
        {
            this.#cgp.pushErrorScope("setpipeline", { "logger": this.#log });

            if (this.#type == Pipeline.TYPE_RENDER) this.#passEncoder = this.#cgp.passEncoder;

            this.#passEncoder.setPipeline(this.#renderPipeline);

            if (this.#cgp.frameStore.branchProfiler) this.#cgp.frameStore.branchStack.push("updateUniforms");

            shader.incBindingCounter();

            if (!this.#bindGroups[shader.bindingCounter])
            {
                const bindingGroupEntries = [];

                if (this.#type == Pipeline.TYPE_RENDER)
                    for (let i = 0; i < shader.bindingsVert.length; i++)
                    {
                        if (shader.bindingsVert[i].getSizeBytes() > 0)
                        {
                            const entry = shader.bindingsVert[i].getBindingGroupEntry(shader.bindingCounter);
                            if (entry)bindingGroupEntries.push(entry);
                        }
                        else this.#log.log("shader defaultBindingVert size 0");
                    }

                if (this.#type == Pipeline.TYPE_RENDER)
                    for (let i = 0; i < shader.bindingsFrag.length; i++)
                    {
                        if (shader.bindingsFrag[i].getSizeBytes() > 0)
                        {
                            const entry = shader.bindingsFrag[i].getBindingGroupEntry(shader.bindingCounter);
                            if (entry)bindingGroupEntries.push(entry);
                        }
                        else this.#log.log("shader defaultBindingFrag size 0");
                    }

                if (this.#type == Pipeline.TYPE_COMPUTE)
                    for (let i = 0; i < shader.bindingsCompute.length; i++)
                    {
                        if (shader.bindingsCompute[i].getSizeBytes() > 0)
                        {
                            const entry = shader.bindingsCompute[i].getBindingGroupEntry(shader.bindingCounter);
                            if (entry)bindingGroupEntries.push(entry);
                        }
                        else this.#log.log("shader defaultBindingCompute size 0");
                    }

                const bg = {
                    "label": this.#name,
                    "layout": this.bindGroupLayout,
                    "entries": bindingGroupEntries
                };

                try
                {
                    this.#bindGroups[shader.bindingCounter] = this.#cgp.device.createBindGroup(bg);
                }
                catch (e)
                {
                    this.#errorCount++;
                    if (this.#errorCount == 3) console.log("stopping error logging for cgp pipeline");
                    if (this.#errorCount >= 3) return;

                    console.log(bg);
                    console.error(e);
                    // console.log(shader);
                    console.log("error mesh:", this.#name);

                }

            }

            this._bindUniforms(shader, shader.bindingCounter);

            if (this.#bindGroups[shader.bindingCounter]) this.#cgp.passEncoder.setBindGroup(0, this.#bindGroups[shader.bindingCounter]);

            if (this.#cgp.frameStore.branchProfiler) this.#cgp.frameStore.branchStack.pop();

            this.#cgp.popErrorScope();
        }
        if (this.#cgp.frameStore.branchProfiler) this.#cgp.frameStore.branchStack.pop();

        this.shaderNeedsPipelineUpdate = "";
    }

    /**
     * @param {CgpShader} shader
     * @returns {GPUPipelineDescriptorBase}
     */
    getPipelineObject(shader)
    {

        /** @type {Array<GPUBindGroupLayoutEntry} */
        this.bindingGroupLayoutEntries = [];

        if (!shader.bindingsVert)
        {
            console.error("shader has no bindingsvert...");
            return;
        }

        for (let i = 0; i < shader.bindingsVert.length; i++)
        {
            if (shader.bindingsVert[i].getSizeBytes() > 0)
            {
                const entry = shader.bindingsVert[i].getBindingGroupLayoutEntry();
                if (entry) this.bindingGroupLayoutEntries.push(entry);
            }
            else this.#log.log("shader defaultBindingVert size 0");
        }

        for (let i = 0; i < shader.bindingsFrag.length; i++)
        {
            if (shader.bindingsFrag[i].getSizeBytes() > 0)
            {
                const entry = shader.bindingsFrag[i].getBindingGroupLayoutEntry();
                if (entry) this.bindingGroupLayoutEntries.push(entry);
            }
            else this.#log.log("shader defaultBindingFrag size 0");
        }
        // //////////

        this.bindGroupLayout = this.#cgp.device.createBindGroupLayout(
            {
                "label": "bg layout " + this.#name,
                "entries": this.bindingGroupLayoutEntries,
            });

        /** @type {GPUPipelineLayout} */
        const pipelineLayout = this.#cgp.device.createPipelineLayout({
            "label": "pipe layout " + this.#name,
            "bindGroupLayouts": [this.bindGroupLayout]
        });

        let buffers = [
            // position
            {
                "arrayStride": 3 * 4, // 3 floats, 4 bytes each
                "attributes": [
                    { "shaderLocation": 0, "offset": 0, "format": "float32x3" },
                ],
            },
            // texcoords
            {
                "arrayStride": 2 * 4, // 2 floats, 4 bytes each
                "attributes": [
                    { "shaderLocation": 2, "offset": 0, "format": "float32x2", },
                ],
            },
            // normals
            {
                "arrayStride": 3 * 4, // 3 floats, 4 bytes each
                "attributes": [
                    { "shaderLocation": 1, "offset": 0, "format": "float32x3" },
                ],
            }];

        const pipeCfg = {
            // "layout": "auto",
            "label": this.#name,
            "layout": pipelineLayout,

        };

        if (this.#type == Pipeline.TYPE_RENDER)
        {
            pipeCfg.primitive = {
                "topology": "triangle-list",
                "cullMode": this.#cgp.stateCullFaceFacing(), // back/none/front

                // "point-list",
                // "line-list",
                // "line-strip",
                // "triangle-list",
                // "triangle-strip"
            };
            pipeCfg.depthStencil = {
                "depthWriteEnabled": this.#cgp.stateDepthWrite(),
                "depthCompare": this.#cgp.stateDepthFunc(),
                "format": "depth24plus",
            };

            pipeCfg.vertex =
            {
                "module": shader.gpuShaderModule,
                "entryPoint": "myVSMain",
                "buffers": buffers
            };

            pipeCfg.fragment =
            {
                "module": shader.gpuShaderModule,
                "entryPoint": "myFSMain",
                "targets": [
                    {
                        "format": this.#cgp.presentationFormat,
                        "blend": this.#cgp.stateBlend()
                    },
                ],
            };
        }
        else if (this.#type == Pipeline.TYPE_COMPUTE)
        {
            pipeCfg.compute =
            {
                "module": shader.gpuShaderModule,
                "entryPoint": shader.options.entryPoint || "main"
            };
        }

        return pipeCfg;
    }

    /**
     * @param {CgpShader} shader
     * @param {number} inst
     */
    _bindUniforms(shader, inst)
    {
        shader.bind();

        if (this.#type == Pipeline.TYPE_RENDER)
        {
            if (this.#cgp.frameStore.branchProfiler) this.#cgp.frameStore.branchStack.push("bind uniforms vert", ["num:" + shader.bindingsVert.length]);
            for (let i = 0; i < shader.bindingsVert.length; i++) shader.bindingsVert[i].update(this.#cgp, inst);
            if (this.#cgp.frameStore.branchProfiler) this.#cgp.frameStore.branchStack.pop();

            if (this.#cgp.frameStore.branchProfiler) this.#cgp.frameStore.branchStack.push("bind uniforms frag", ["num:" + shader.bindingsFrag.length]);
            for (let i = 0; i < shader.bindingsFrag.length; i++) shader.bindingsFrag[i].update(this.#cgp, inst);
            if (this.#cgp.frameStore.branchProfiler) this.#cgp.frameStore.branchStack.pop();
        }
        if (this.#type == Pipeline.TYPE_COMPUTE)
        {
            if (this.#cgp.frameStore.branchProfiler) this.#cgp.frameStore.branchStack.push("bind uniforms compute", ["num:" + shader.bindingsFrag.length]);
            for (let i = 0; i < shader.bindingsCompute.length; i++) shader.bindingsCompute[i].update(this.#cgp, inst);
            if (this.#cgp.frameStore.branchProfiler) this.#cgp.frameStore.branchStack.pop();

        }

    }

    /**
     * @param {CgpShader} shader
     * @param {Array} workGroups
     */
    compute(shader, workGroups = [8, 8])
    {

        if (this.#type != Pipeline.TYPE_COMPUTE)
        {
            this.#log.warn("no compute pipe");
            return;
        }

        if (!shader.gpuShaderModule) shader.compile();

        /** @type {GPUCommandEncoder} */
        const commandEncoder = this.#cgp.device.createCommandEncoder();

        console.log(this.bindGroupLayout);

        this.#passEncoder = commandEncoder.beginComputePass();

        if (!this.#renderPipeline) this.setPipeline(shader);
        if (!this.#renderPipeline)
        {
            this.#log.warn("no render pipe");
            return;
        }
        this.#passEncoder.setPipeline(this.#renderPipeline);

        // this._passEncoder.setBindGroup(0, bindGroup);

        if (workGroups.length == 1) this.#passEncoder.dispatchWorkgroups(workGroups[0] || 8);
        if (workGroups.length == 2) this.#passEncoder.dispatchWorkgroups(workGroups[0] || 8, workGroups[1] || 8);
        if (workGroups.length == 3) this.#passEncoder.dispatchWorkgroups(workGroups[0] || 8, workGroups[1] || 8, workGroups[2] || 8);

        this.#passEncoder.end();

        const gpuCommands = commandEncoder.finish();
        this.#cgp.device.queue.submit([gpuCommands]);

        // this._passEncoder = commandEncoder.beginComputePass();
        // this._passEncoder.setPipeline(computePipeline);
        // this._passEncoder.setBindGroup(0, bindGroup);
        // outBuff.setRef(gpuBuff);

        this.#passEncoder.end();

    }
}
