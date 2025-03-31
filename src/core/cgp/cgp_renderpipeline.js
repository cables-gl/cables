/// <reference types="@webgpu/types" />
import { Logger } from "cables-shared-client";
import { CgpContext } from "./cgp_state.js";
import { CgpShader } from "./cgp_shader.js";
import { CgpMesh } from "./cgp_mesh.js";
import { Pipeline } from "./cgp_pipeline.js";

export class RenderPipeline extends Pipeline
{
    static DEPTH_COMPARE_FUNCS_STRINGS = ["never", "less", "equal", "lessequal", "greater", "notequal", "greaterequal", "always"];

    #isValid = true;

    /** @type {string} */
    presentationFormat = null;

    /** @type {GPURenderPipelineDescriptor} */
    #pipeCfg = null;

    /** @type {GPURenderPipeline} */
    #renderPipeline = null;

    /** @type {GPUBindGroupLayout} */
    bindGroupLayout = null;

    /** @type {GPURenderPassEncoder} */
    #passEncoder;

    #shaderListeners = [];
    #old = {};
    #errorCount = 0;
    #type = RenderPipeline.TYPE_RENDER;
    lastRebuildReason = "first";
    #rebuildNumBindingGroups = false;

    /**
     * Description
     * @param {CgpContext} _cgp
     * @param {String} name
     */
    constructor(_cgp, name)
    {
        super(_cgp, name, Pipeline.TYPE_RENDER);
    }

    /**
     * @param {CgpShader} shader
     * @param {CgpMesh} mesh
     */
    setPipeline(shader, mesh = null)
    {
        if (this.#type == RenderPipeline.TYPE_RENDER)
        {
            if (!mesh)
            {
                this.log.log("pipeline unknown mesh");
                return;
            }
        }
        if (!shader)
        {
            this.log.log("pipeline unknown shader");
            return;
        }

        if (this.cgp.branchProfiler) this.cgp.branchProfiler.push("setPipeline", this.name, { "info": this.getInfo(), "shader": shader.getInfo() });

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

        if (this.#type == RenderPipeline.TYPE_RENDER && mesh.needsPipelineUpdate)
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
            if (this.#type == RenderPipeline.TYPE_RENDER)
            {
                this.#pipeCfg =/** @type {GPURenderPipelineDescriptor} */ (this.#pipeCfg || {});
                if (this.#pipeCfg.depthStencil.depthWriteEnabled != this.cgp.stateDepthWrite())
                {
                    needsRebuildReason = "depth changed";
                    this.#pipeCfg.depthStencil.depthWriteEnabled = !!this.cgp.stateDepthWrite();
                }

                if (this.#pipeCfg.fragment.targets[0].blend != this.cgp.stateBlend())
                {
                    needsRebuildReason = "blend changed";
                    this.#pipeCfg.fragment.targets[0].blend = this.cgp.stateBlend();
                }

                if (this.cgp.stateDepthTest() === false)
                {
                    if (this.#pipeCfg.depthStencil.depthCompare != "never")
                    {
                        this.#pipeCfg.depthStencil.depthCompare = "never";
                        needsRebuildReason = "depth compare changed";
                    }
                }
                else
                if (this.#pipeCfg.depthStencil.depthCompare != this.cgp.stateDepthFunc())
                {
                    needsRebuildReason = "depth state ";
                    this.#pipeCfg.depthStencil.depthCompare = this.cgp.stateDepthFunc();
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
            this.cgp.pushErrorScope("createPipeline", { "logger": this.log });

            this.#rebuildNumBindingGroups = false;

            this.#pipeCfg = this.getPipelineObject(shader);
            console.log(this.#pipeCfg);

            this.#old.device = this.cgp.device;
            this.#old.shader = shader;
            this.#old.mesh = mesh;
            this.#isValid = true;

            try
            {

                this.#renderPipeline = this.cgp.device.createRenderPipeline(this.#pipeCfg);

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

        if (this.#renderPipeline && this.#isValid)
        {
            this.cgp.pushErrorScope("setpipeline", { "logger": this.log });

            let passEnc = this.cgp.passEncoder;

            // if (this.#type != RenderPipeline.TYPE_RENDER) passEnc = this.#passEncoder;

            if (this.cgp.branchProfiler) this.cgp.branchProfiler.push("pipe updateUniforms", this.name, { "shader": shader.getInfo() });

            /// ///////////////////

            shader.bind();
            passEnc.setPipeline(this.#renderPipeline);

            if (this.cgp.branchProfiler) this.cgp.branchProfiler.pop();

            this.cgp.popErrorScope();
        }
        if (this.cgp.branchProfiler) this.cgp.branchProfiler.pop();

    }

    /**
     * @param {CgpShader} shader
     * @returns {GPURenderPipelineDescriptor}
     */
    getPipelineObject(shader)
    {

        this.bindingGroupLayoutEntries = [];
        this.bindingGroupLayoutEntries = shader.defaultBindGroup.getLayoutEntries();

        const bindGroupLayouts = [shader.defaultBindGroup.getLayout()];

        /** @type {GPUPipelineLayout} */
        const pipelineLayout = this.cgp.device.createPipelineLayout({
            "label": "pipe layout " + this.name,
            "bindGroupLayouts": bindGroupLayouts
        });

        /** @type {Array<GPUVertexBufferLayout>} */
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

        /** @type {GPURenderPipelineDescriptor} */
        let pipeCfg = {
            "label": this.name,
            "layout": pipelineLayout,

            "primitive": {
                "topology": "triangle-list",
                "cullMode": "none", // this.#cgp.stateCullFaceFacing(), // back/none/front
            // "point-list",
            // "line-list",
            // "line-strip",
            // "triangle-list",
            // "triangle-strip"
            },
            "depthStencil": {
                "depthWriteEnabled": this.cgp.stateDepthWrite(),
                "depthCompare": this.cgp.stateDepthFunc(),
                "format": "depth24plus",
            },
            "vertex":
            {
                "module": shader.gpuShaderModule,
                "entryPoint": "myVSMain",
                "buffers": buffers
            },
            "fragment":
            {
                "module": shader.gpuShaderModule,
                "entryPoint": "myFSMain",
                "targets": [
                    {
                        "format": this.cgp.presentationFormat,
                        "blend": this.cgp.stateBlend()
                    },
                ],
            }
        };
        return pipeCfg;
    }

    dispose()
    {
        // todo...
    }

}
