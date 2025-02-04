import { Logger } from "cables-shared-client";
import { WebGpuContext } from "./cgp_state.js";
import Shader from "./cgp_shader.js";
import Mesh from "./cgp_mesh.js";
import CgpShader from "./cgp_shader.js";

export default class Pipeline
{
    #name = "";
    #cgp = null;
    #pipeCfg = null;
    #log = new Logger("pipeline");
    #isValid = true;
    #renderPipeline = null;
    #bindGroups = [];
    #shaderListeners = [];
    #old = {};
    #errorCount = 0;

    shaderNeedsPipelineUpdate = "";

    static DEPTH_COMPARE_FUNCS_STRINGS = ["never", "less", "equal", "lessequal", "greater", "notequal", "greaterequal", "always"];

    /**
     * Description
     * @param {WebGpuContext} _cgp
     * @param {String} name
     */
    constructor(_cgp, name)
    {
        if (!_cgp) throw new Error("Pipeline constructed without cgp " + name);
        this.#name = name;
        this.#cgp = _cgp;

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
     * @param {Shader} oldShader
     * @param {Shader} newShader
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
     * @param {Shader} shader
     * @param {Mesh} mesh
     */
    setPipeline(shader, mesh)
    {
        if (!mesh || !shader)
        {
            this.#log.log("pipeline unknown shader/mesh");
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
        if (mesh.needsPipelineUpdate)
        {
            needsRebuildReason = "mesh needs update";
            mesh.needsPipelineUpdate = false;
        }
        if (this.shaderNeedsPipelineUpdate)needsRebuildReason = "shader was recompiled: " + this.shaderNeedsPipelineUpdate;

        if (this.#pipeCfg)
        {
            if (this.#pipeCfg.depthStencil.depthWriteEnabled != this.#cgp.stateDepthWrite())
            {
                needsRebuildReason = "depth changed";
                this.#pipeCfg.depthStencil.depthWriteEnabled = this.#cgp.stateDepthWrite();
            }

            if (this.#pipeCfg.fragment.targets[0].blend != this.#cgp.stateBlend())
            {
                needsRebuildReason = "blend changed";
                this.#pipeCfg.fragment.targets[0].blend = this.#cgp.stateBlend();
            }

            // "fragment": {
            //     "module": shader.gpuShaderModule,
            //     "entryPoint": "myFSMain",
            //     "targets": [
            //         {
            //             "format": this._cgp.presentationFormat,
            //             "blend":
            //         },

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

            this.#pipeCfg = this.getPipelineObject(shader, mesh);

            this.#old.device = this.#cgp.device;
            this.#old.shader = shader;
            this.#old.mesh = mesh;

            try
            {
                this.#renderPipeline = this.#cgp.device.createRenderPipeline(this.#pipeCfg);
            }
            catch (e)
            {
                console.error("catc", e.message, this.#pipeCfg);
                this.#isValid = false;
            }

            this.#cgp.popErrorScope();
        }

        if (this.#renderPipeline && this.#isValid)
        {
            this.#cgp.pushErrorScope("setpipeline", { "logger": this.#log });

            // this._cgp.passEncoder.setViewport(this._cgp.viewPort[0], this._cgp.viewPort[1], this._cgp.viewPort[2], this._cgp.viewPort[3], -1000, 1000);
            this.#cgp.passEncoder.setPipeline(this.#renderPipeline);

            if (this.#cgp.frameStore.branchProfiler) this.#cgp.frameStore.branchStack.push("updateUniforms");

            shader.incBindingCounter();

            if (!this.#bindGroups[shader.bindingCounter])
            {
                const bindingGroupEntries = [];

                for (let i = 0; i < shader.bindingsVert.length; i++)
                {
                    if (shader.bindingsVert[i].getSizeBytes() > 0)
                    {
                        const entry = shader.bindingsVert[i].getBindingGroupEntry(shader.bindingCounter);
                        if (entry)bindingGroupEntries.push(entry);
                    }
                    else this.#log.log("shader defaultBindingVert size 0");
                }
                for (let i = 0; i < shader.bindingsFrag.length; i++)
                {
                    if (shader.bindingsFrag[i].getSizeBytes() > 0)
                    {
                        const entry = shader.bindingsFrag[i].getBindingGroupEntry(shader.bindingCounter);
                        if (entry)bindingGroupEntries.push(entry);
                    }
                    else this.#log.log("shader defaultBindingFrag size 0");
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
     * @param {Mesh} mesh
     */
    getPipelineObject(shader, mesh)
    {
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
            "vertex": {
                "module": shader.gpuShaderModule,
                "entryPoint": "myVSMain",
                "buffers": buffers

            },
            "fragment": {
                "module": shader.gpuShaderModule,
                "entryPoint": "myFSMain",
                "targets": [
                    {
                        "format": this.#cgp.presentationFormat,
                        "blend": this.#cgp.stateBlend()
                    },
                ],
            },
            "primitive": {
                "topology": "triangle-list",
                "cullMode": this.#cgp.stateCullFaceFacing(), // back/none/front

                // "point-list",
                // "line-list",
                // "line-strip",
                // "triangle-list",
                // "triangle-strip"
            },
            "depthStencil": {
                "depthWriteEnabled": this.#cgp.stateDepthTest(),
                "depthCompare": this.#cgp.stateDepthFunc(),
                "format": "depth24plus",
            },

        };

        return pipeCfg;
    }

    _bindUniforms(shader, inst)
    {
        shader.bind();

        if (this.#cgp.frameStore.branchProfiler) this.#cgp.frameStore.branchStack.push("bind uniforms vert", ["num:" + shader.bindingsVert.length]);
        for (let i = 0; i < shader.bindingsVert.length; i++) shader.bindingsVert[i].update(this.#cgp, inst);
        if (this.#cgp.frameStore.branchProfiler) this.#cgp.frameStore.branchStack.pop();

        if (this.#cgp.frameStore.branchProfiler) this.#cgp.frameStore.branchStack.push("bind uniforms frag", ["num:" + shader.bindingsFrag.length]);
        for (let i = 0; i < shader.bindingsFrag.length; i++) shader.bindingsFrag[i].update(this.#cgp, inst);
        if (this.#cgp.frameStore.branchProfiler) this.#cgp.frameStore.branchStack.pop();

    }
}
