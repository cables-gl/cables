/// <reference types="@webgpu/types" />
import { CgpContext } from "./cgp_state.js";
import { CgpShader } from "./cgp_shader.js";
import { CgpMesh } from "./cgp_mesh.js";
import { Pipeline } from "./cgp_pipeline.js";

export class ComputePipeline extends Pipeline
{

    #isValid = true;

    /** @type {string} */
    presentationFormat = null;

    /** @type {GPUComputePipelineDescriptor} */
    #pipeCfg = null;

    /** @type {GPUComputePipeline} */
    #computePipeline = null;

    /** @type {GPUBindGroupLayout} */
    bindGroupLayout = null;

    /** @type {GPUComputePassEncoder} */
    #computePassEncoder;

    #shaderListeners = [];
    #old = {};
    #errorCount = 0;
    lastRebuildReason = "first";
    rebuildCount = 0;
    profile = false;
    #rebuildNumBindingGroups = false;

    /**
     * Description
     * @param {CgpContext} _cgp
     * @param {String} name
     */
    constructor(_cgp, name)
    {
        super(_cgp, name, Pipeline.TYPE_COMPUTE);
    }

    /**
     * @param {CgpShader} shader
     * @param {CgpMesh} mesh
     */
    setPipeline(shader, mesh = null)
    {
        if (!shader)
        {
            this.log.log("pipeline unknown shader");
            return;
        }

        let needsRebuildReason = "";
        if (!this.#pipeCfg)needsRebuildReason = "no pipecfg";
        if (this.#old.mesh != mesh)needsRebuildReason = "no mesh";
        if (this.#old.shader != shader)
        {
            needsRebuildReason = "shader changed";
        }

        if (shader.needsPipelineUpdate)
        {
            needsRebuildReason = "shader needs update: " + shader.needsPipelineUpdate;
            shader.needsPipelineUpdate = "";
        }

        if (this.#rebuildNumBindingGroups)
        {
            needsRebuildReason = "num bindgroups wrong...";
        }

        this.pushDebug();

        if (needsRebuildReason != "")
        {
            this.cgp.profileData.count("pipeline created", this.name);

            this.lastRebuildReason = needsRebuildReason;
            this.rebuildCount++;
            // console.log("needsRebuildReason");
            this.cgp.pushErrorScope("createPipeline", { "logger": this.log });

            this.#rebuildNumBindingGroups = false;

            this.#pipeCfg = this.getPipelineObject(shader);
            // console.log(this.#pipeCfg);

            this.#old.device = this.cgp.device;
            this.#old.shader = shader;
            this.#old.mesh = mesh;
            this.#isValid = true;
            // console.log(this.#pipeCfg);
            try
            {
                this.#computePipeline = this.cgp.device.createComputePipeline(this.#pipeCfg);
            }
            catch (e)
            {
                console.error("pipe error catch...", e.message, this.#pipeCfg);
                this.#isValid = false;
            }

            this.cgp.popErrorScope(
                () =>
                {
                    console.log("this.#pipeCfg", this.#pipeCfg);
                });
        }

        if (this.cgp.branchProfiler) this.cgp.branchProfiler.pop();

    }

    /**
     * @param {CgpShader} shader
     * @returns {GPUComputePipelineDescriptor}
     */
    getPipelineObject(shader)
    {

        /** @type {Array<GPUBindGroupLayoutEntry>} */
        this.bindingGroupLayoutEntries = [];
        this.bindingGroupLayoutEntries = shader.defaultBindGroup.getLayoutEntries(shader);

        const bindGroupLayouts = [shader.defaultBindGroup.getLayout(shader)];

        /** @type {GPUPipelineLayout} */
        const pipelineLayout = this.cgp.device.createPipelineLayout({
            "label": "pipe layout " + this.name,
            "bindGroupLayouts": bindGroupLayouts
        });

        /** @type {GPUComputePipelineDescriptor} */
        let pipeCfg = {
            "label": this.name,
            "layout": pipelineLayout,
            "compute":
            {
                "module": shader.gpuShaderModule,
                "entryPoint": shader.options.entryPoint || "main"
            }
        };
        // console.log("pipecft", pipeCfg, bindGroupLayouts);

        return pipeCfg;
    }

    /**
     * @param {CgpShader} shader
     * @param {Array} workGroups
     */
    compute(shader, workGroups = [8, 8])
    {
        if (!shader.gpuShaderModule) shader.compile();

        /** @type {GPUCommandEncoder} */
        const commandEncoder = this.cgp.device.createCommandEncoder();

        this.#computePassEncoder = commandEncoder.beginComputePass({ "label": "computepass " + shader.getName() });

        // if (!this.#computePipeline)
        this.setPipeline(shader);

        if (!this.#computePipeline)
        {
            this.log.warn("no render pipe");
            return;
        }

        this.#computePassEncoder.setPipeline(this.#computePipeline);
        shader.bind(this.#computePassEncoder);

        if (workGroups.length == 1) this.#computePassEncoder.dispatchWorkgroups(workGroups[0] || 8);
        else if (workGroups.length == 2) this.#computePassEncoder.dispatchWorkgroups(workGroups[0] || 8, workGroups[1] || 8);
        else if (workGroups.length == 3) this.#computePassEncoder.dispatchWorkgroups(workGroups[0] || 8, workGroups[1] || 8, workGroups[2] || 8);
        else console.log("workgroups length wrong,,,");
        // console.log("workgr ", workGroups);
        this.#computePassEncoder.end();

        this.cgp.profileData.count("compute pipe", this.name);
        // console.log("llllllll", shader.defaultBindGroup.getLayout());
        const gpuCommands = commandEncoder.finish();
        this.cgp.device.queue.submit([gpuCommands]);
        this.pushDebug();
        // const entry = shader.bindingsVert[i].getBindingGroupEntry(shader.bindingCounter);
        // this._passEncoder = commandEncoder.beginComputePass();
        // this._passEncoder.setPipeline(computePipeline);
        // this.#passEncoder.setBindGroup(0, shader.defaultBindGroupshader.defaultBindGroup;
        // outBuff.setRef(gpuBuff);

    }

    dispose()
    {
        // todo...
    }

}
