/// <reference types="@webgpu/types" />
import { Logger } from "cables-shared-client";
import { CgpContext } from "./cgp_state.js";
import { CgpShader } from "./cgp_shader.js";
import { CgpMesh } from "./cgp_mesh.js";

export class Pipeline
{
    static DEPTH_COMPARE_FUNCS_STRINGS = ["never", "less", "equal", "lessequal", "greater", "notequal", "greaterequal", "always"];

    static TYPE_RENDER = 0;
    static TYPE_COMPUTE = 1;

    #log = new Logger("pipeline");
    #name = "";

    /** @type {CgpContext} */
    #cgp = null;
    #isValid = true;

    /** @type {string} */
    presentationFormat = null;

    /** @type {GPURenderPipelineDescriptor|GPURenderPipelineDescriptor} */
    #pipeCfg = null;

    /** @type {GPURenderPipeline|GPUComputePipeline} */
    #renderPipeline = null;

    /** @type {GPUComputePipeline} */
    #computePipeline = null;

    /** @type {GPUBindGroupLayout} */
    bindGroupLayout = null;

    /** @type {GPUBindGroup} */
    #bindGroup = null;

    /** @type {GPURenderPassEncoder|GPUComputePassEncoder} */
    #passEncoder;

    #shaderListeners = [];
    #old = {};
    #errorCount = 0;
    #type = Pipeline.TYPE_RENDER;
    lastRebuildReason = "first";
    rebuildCount = 0;
    profile = false;
    #rebuildNumBindingGroups = false;

    profiler;

    /**
     * Description
     * @param {CgpContext} _cgp
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
            newShader.on("compiled", (reason) =>
            {
                // this._log.log("pipe update shader compileeeeeee");
                // this.needsRebuildReason = "shader changed";
                this.needsRebuildReason = "shader compiled: " + reason || "???";
            }));
    }

    getInfo()
    {
        const info = {
            "class": this.constructor.name,
            "name": this.#name,
            "rebuildReason": this.lastRebuildReason,
            "rebuildCount": this.rebuildCount,
            // "numBindgroups": this.#bindingInstances.length,
            "bindingGroupLayoutEntries": this.bindingGroupLayoutEntries,
        };

        if (this.#type == Pipeline.TYPE_COMPUTE)info.type = "COMPUTE";
        if (this.#type == Pipeline.TYPE_RENDER)info.type = "RENDER";

        return info;
    }

    pushDebug()
    {
        this.#cgp.currentPipeDebug =
        {
            "cfg": this.#pipeCfg,
            "bindingGroupLayoutEntries": this.bindingGroupLayoutEntries
        };
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

        if (this.#cgp.branchProfiler) this.#cgp.branchProfiler.push("setPipeline", this.#name, { "info": this.getInfo(), "shader": shader.getInfo() });

        let needsRebuildReason = "";
        if (!this.#renderPipeline) needsRebuildReason = "no renderpipeline";
        if (!this.#pipeCfg)needsRebuildReason = "no pipecfg";
        if (this.#old.mesh != mesh)needsRebuildReason = "no mesh";
        if (this.#old.shader != shader)
        {
            this.setShaderListener(this.#old.shader, shader);
            console.log("shader changed?!@");
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

        if (this.#rebuildNumBindingGroups)
        {
            needsRebuildReason = "num bindgroups wrong...";
        }

        if (this.#pipeCfg)
        {
            if (this.#type == Pipeline.TYPE_RENDER)
            {
                this.#pipeCfg =/** @type {GPURenderPipelineDescriptor} */ (this.#pipeCfg || {});
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

                // if (this.#pipeCfg.primitive.cullMode != this.#cgp.stateCullFaceFacing())
                // {
                //     needsRebuildReason = "cullmode change";
                //     // this.#pipeCfg.primitive.cullMode = this.#cgp.stateCullFaceFacing();
                // console.log(this.#cgp.stateCullFaceFacing());
                // }

            }

        }

        this.pushDebug();

        if (needsRebuildReason != "")
        {
            this.lastRebuildReason = needsRebuildReason;
            this.rebuildCount++;
            // console.log("needsRebuildReason");
            console.log("rebuild pipe", needsRebuildReason);
            this.#cgp.pushErrorScope("createPipeline", { "logger": this.#log });

            // this.#bindingInstances = [];

            this.#rebuildNumBindingGroups = false;

            this.#pipeCfg = this.getPipelineObject(shader);
            console.log(this.#pipeCfg);

            this.#old.device = this.#cgp.device;
            this.#old.shader = shader;
            this.#old.mesh = mesh;
            this.#isValid = true;

            try
            {

                if (this.#type == Pipeline.TYPE_RENDER) this.#renderPipeline = this.#cgp.device.createRenderPipeline(this.#pipeCfg);
                else if (this.#type == Pipeline.TYPE_COMPUTE) this.#renderPipeline = this.#cgp.device.createComputePipeline(this.#pipeCfg);

                // if (this.#bindGroups[shader.bindingCounter])
                // {
                //     console.log("bindgroupppppppp", this.#bindGroups[shader.bindingCounter]);
                // }

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

            this.#cgp.popErrorScope(
                () =>
                {
                    console.log("this.#pipeCfg", this.#pipeCfg);
                });
        }

        if (this.#renderPipeline && this.#isValid)
        {
            this.#cgp.pushErrorScope("setpipeline", { "logger": this.#log });

            let passEnc = this.#cgp.passEncoder;

            if (this.#type != Pipeline.TYPE_RENDER) passEnc = this.#passEncoder;

            // this.#passEncoder.setPipeline(this.#renderPipeline);
            // this.#cgp.passEncoder.setPipeline(this.#renderPipeline);
            // else

            if (this.#cgp.branchProfiler) this.#cgp.branchProfiler.push("pipe updateUniforms", this.#name, { "shader": shader.getInfo() });

            // console.log("shader.frameUsageCounter", shader.frameUsageCounter);

            if (!this.#bindGroup)
            {
                console.log("create bindgroups....");
                let bindingGroupEntries = [];

                for (let i = 0; i < shader.bindGroups.length; i++)
                {
                    bindingGroupEntries = shader.bindGroups[i].getEntries();

                }

                console.log(bindingGroupEntries);

                // if (this.#type == Pipeline.TYPE_RENDER && shader.bindingsVert)
                //     for (let i = 0; i < shader.bindingsVert.length; i++)
                //     {
                //         if (shader.bindingsVert[i] && shader.bindingsVert[i].getSizeBytes() > 0)
                //         {
                //             const entry = shader.bindingsVert[i].getBindingGroupEntry(shader.frameUsageCounter);
                //             if (entry)bindingGroupEntries.push(entry);
                //         }
                //         else this.#log.log("shader defaultBindingVert size 0");
                //     }

                // if (this.#type == Pipeline.TYPE_RENDER && shader.bindingsFrag)
                //     for (let i = 0; i < shader.bindingsFrag.length; i++)
                //     {
                //         if (shader.bindingsFrag[i] && shader.bindingsFrag[i].getSizeBytes() > 0)
                //         {
                //             const entry = shader.bindingsFrag[i].getBindingGroupEntry(shader.frameUsageCounter);
                //             if (entry)bindingGroupEntries.push(entry);
                //         }
                //         else this.#log.log("shader defaultBindingFrag size 0");
                //     }

                // if (this.#type == Pipeline.TYPE_COMPUTE && shader.bindingsCompute)
                //     for (let i = 0; i < shader.bindingsCompute.length; i++)
                //     {
                //         if (shader.bindingsCompute[i] && shader.bindingsCompute[i].getSizeBytes() > 0)
                //         {
                //             const entry = shader.bindingsCompute[i].getBindingGroupEntry(shader.frameUsageCounter);
                //             if (entry)bindingGroupEntries.push(entry);
                //         }
                //         else this.#log.log("shader defaultBindingCompute size 0");
                //     }

                /** @type {GPUBindGroupDescriptor} */
                const bg = {
                    "label": "pipe bg " + this.#name,
                    "layout": this.bindGroupLayout,
                    "entries": bindingGroupEntries
                };

                if (bindingGroupEntries.length != this.bindingGroupLayoutEntries.length)
                {
                    this.#log.error("bindingGroupEntries.length!= this.bindingGroupLayoutEntries.length", bindingGroupEntries.length, this.bindingGroupLayoutEntries.length);
                    this.#rebuildNumBindingGroups = true;
                    this.#isValid = false;
                    return;
                }

                try
                {
                    this.#bindGroup = this.#cgp.device.createBindGroup(bg);

                }
                catch (e)
                {
                    this.#errorCount++;
                    if (this.#errorCount == 3) console.log("stopping error logging for cgp pipeline");
                    if (this.#errorCount >= 3) return;

                    console.log(bg);
                    console.error(e);
                    console.log("error mesh:", this.#name);
                }

            }

            /// ///////////////////

            // console.log("shader.bindingCounter", shader.bindingCounter, this.#bindGroups.length);

            // for (let i = 0; i < this.#bindingInstances.length; i++)
            // {
            //     // console.log("stBG", i, this.#bindGroups[i]);
            //     if (!this.#bindingInstances[i])
            //     {
            //         console.log("bindgroup " + i + " is undefined?!");
            //         // return;
            //     }
            //     else
            //         this.#cgp.passEncoder.setBindGroup(i, this.#bindingInstances[i]);
            // }

            this.#cgp.passEncoder.setBindGroup(0, this.#bindGroup);

            if (!this.#bindGroup)
            {
                console.warn("No effing bindgroups...");
            }
            else
            {
                passEnc.setPipeline(this.#renderPipeline);

                this._bindUniforms(shader, shader.frameUsageCounter);
            }

            if (this.#cgp.branchProfiler) this.#cgp.branchProfiler.pop();

            this.#cgp.popErrorScope();
        }
        if (this.#cgp.branchProfiler) this.#cgp.branchProfiler.pop();

    }

    /**
     * @param {CgpShader} shader
     * @returns {GPUPipelineDescriptorBase|GPURenderPipelineDescriptor|GPUComputePipelineDescriptor}
     */
    getPipelineObject(shader)
    {

        /** @type {Array<GPUBindGroupLayoutEntry>} */
        this.bindingGroupLayoutEntries = [];

        // if (!shader.bindingsVert)
        // {
        //     console.error("shader has no bindingsvert...");
        //     return;
        // }

        this.bindingGroupLayoutEntries = shader.defaultBindGroup.getLayoutEntries();

        // if (shader.bindingsVert)
        //     for (let i = 0; i < shader.bindingsVert.length; i++)
        //     {
        //         // if (shader.bindingsVert[i] && shader.bindingsVert[i].getSizeBytes() > 0)
        //         // {
        //         const entry = shader.bindingsVert[i].getBindingGroupLayoutEntry();
        //         if (entry) this.bindingGroupLayoutEntries.push(entry);
        //         // }
        //         // else this.#log.log("shader defaultBindingVert size 0");
        //     }

        // if (shader.bindingsFrag)
        //     for (let i = 0; i < shader.bindingsFrag.length; i++)
        //     {
        //         // if (shader.bindingsFrag[i] && shader.bindingsFrag[i].getSizeBytes() > 0)
        //         // {
        //         const entry = shader.bindingsFrag[i].getBindingGroupLayoutEntry();
        //         if (entry) this.bindingGroupLayoutEntries.push(entry);
        //         // }
        //         // else this.#log.log("shader defaultBindingFrag size 0");
        //     }

        // if (shader.bindingsCompute)
        //     for (let i = 0; i < shader.bindingsCompute.length; i++)
        //     {
        //         console.log("bindingsCompute", i, shader.bindingsCompute[i]);

        //         // if (shader.bindingsCompute[i] && shader.bindingsCompute[i].getSizeBytes() > 0)
        //         // {
        //         const entry = shader.bindingsCompute[i].getBindingGroupLayoutEntry();
        //         if (entry) this.bindingGroupLayoutEntries.push(entry);
        //         // }
        //         // else this.#log.log("shader defaultBindingCompute size 0");
        //     }
        // //////////

        /** @type {GPUBindGroupLayout} */
        this.bindGroupLayout = this.#cgp.device.createBindGroupLayout(
            {
                "label": "bindgrouplayout " + this.#name,
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

        /** @type {GPUPipelineDescriptorBase} */
        let pipeCfg = {
            // "layout": "auto",
            "label": this.#name,
            "layout": pipelineLayout,

        };

        if (this.#type == Pipeline.TYPE_RENDER)
        {
            const renderCfg = /** @type {GPURenderPipelineDescriptor} */ (pipeCfg || {});
            renderCfg.primitive = {
                "topology": "triangle-list",
                "cullMode": "none", // this.#cgp.stateCullFaceFacing(), // back/none/front

                // "point-list",
                // "line-list",
                // "line-strip",
                // "triangle-list",
                // "triangle-strip"
            };
            renderCfg.depthStencil = {
                "depthWriteEnabled": this.#cgp.stateDepthWrite(),
                "depthCompare": this.#cgp.stateDepthFunc(),
                "format": "depth24plus",
            };

            renderCfg.vertex =
            {
                "module": shader.gpuShaderModule,
                "entryPoint": "myVSMain",
                "buffers": buffers
            };

            renderCfg.fragment =
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
            const computeCfg = /** @type {GPUComputePipelineDescriptor} */ (pipeCfg || {});

            computeCfg.compute =
            {
                "module": shader.gpuShaderModule,
                "entryPoint": shader.options.entryPoint || "main"
            };
            console.log(computeCfg.compute);
        }

        // console.log("bindgrouplayutEntries:", this.bindingGroupLayoutEntries.length);
        // console.log("compute:", shader.bindingsCompute.length);
        // console.log("frag:", shader.bindingsFrag.length);
        // console.log("vert:", shader.bindingsVert.length);

        return pipeCfg;
    }

    getBindingsInfo(bings)
    {
        const arr = [];
        for (let i = 0; i < bings.length; i++)
        {
            arr.push(bings[i].getInfo());
        }
        return arr;
    }

    /**
     * @param {CgpShader} shader
     * @param {number} inst
     */
    _bindUniforms(shader, inst)
    {
        shader.bind();

        // if (this.#type == Pipeline.TYPE_RENDER)
        // {
        //     if (this.#cgp.branchProfiler) this.#cgp.branchProfiler.push("bind uniforms vert", { "class": this.constructor.name, "name": this.#name, "instance": inst, "bindings": this.getBindingsInfo(shader.bindingsVert) });
        //     for (let i = 0; i < shader.bindingsVert.length; i++) shader.bindingsVert[i].update(inst);
        //     if (this.#cgp.branchProfiler) this.#cgp.branchProfiler.pop();

        //     if (this.#cgp.branchProfiler) this.#cgp.branchProfiler.push("bind uniforms frag", { "class": this.constructor.name, "name": this.#name, "instance": inst, "bindings": this.getBindingsInfo(shader.bindingsFrag) });
        //     for (let i = 0; i < shader.bindingsFrag.length; i++) shader.bindingsFrag[i].update(inst);
        //     if (this.#cgp.branchProfiler) this.#cgp.branchProfiler.pop();
        // }
        // if (this.#type == Pipeline.TYPE_COMPUTE)
        // {
        //     if (this.#cgp.branchProfiler) this.#cgp.branchProfiler.push("bind uniforms compute", { "class": this.constructor.name, "name": this.#name, "instance": inst, "bindings": this.getBindingsInfo(shader.bindingsFrag) });
        //     for (let i = 0; i < shader.bindingsCompute.length; i++) shader.bindingsCompute[i].update(inst);
        //     if (this.#cgp.branchProfiler) this.#cgp.branchProfiler.pop();
        // }
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

        this.#passEncoder = commandEncoder.beginComputePass({ "label": "computepass " + shader.getName() });

        if (!this.#renderPipeline) this.setPipeline(shader);
        if (!this.#renderPipeline)
        {
            this.#log.warn("no render pipe");
            return;
        }

        this.#passEncoder.setPipeline(this.#renderPipeline);

        // TODO BINDGROUPCOUNTER?!
        // this.#passEncoder.setBindGroup(0, this.#bindGroup);

        if (workGroups.length == 1) this.#passEncoder.dispatchWorkgroups(workGroups[0] || 8);
        if (workGroups.length == 2) this.#passEncoder.dispatchWorkgroups(workGroups[0] || 8, workGroups[1] || 8);
        if (workGroups.length == 3) this.#passEncoder.dispatchWorkgroups(workGroups[0] || 8, workGroups[1] || 8, workGroups[2] || 8);

        this.#passEncoder.end();

        const gpuCommands = commandEncoder.finish();
        this.#cgp.device.queue.submit([gpuCommands]);
        this.pushDebug();
        // const entry = shader.bindingsVert[i].getBindingGroupEntry(shader.bindingCounter);
        // this._passEncoder = commandEncoder.beginComputePass();
        // this._passEncoder.setPipeline(computePipeline);
        // this._passEncoder.setBindGroup(0, bindGroup);
        // outBuff.setRef(gpuBuff);

    }

    dispose()
    {
        // todo...
    }

}
