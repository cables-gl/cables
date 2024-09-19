import { Logger } from "cables-shared-client";
import { Uniform } from "../cgl/cgl_shader_uniform.js";
import UniformBuffer from "./cgp_uniformbuffer.js";

export default class Pipeline
{
    constructor(_cgp, name)
    {
        if (!_cgp) throw new Error("Pipeline constructed without cgp " + name);
        this._name = name;
        this._cgp = _cgp;
        this._isValid = true;
        this._log = new Logger("pipeline");

        this._pipeCfg = null;
        this._renderPipeline = null;

        this._old = {};

        this.DEPTH_COMPARE_FUNCS_STRINGS = [
            "never",
            "less",
            "equal",
            "lessequal",
            "greater",
            "notequal",
            "greaterequal",
            "always"];
    }

    get isValid() { return this._isValid; }

    setPipeline(shader, mesh)
    {
        if (!mesh || !shader)
        {
            console.log("pipeline unknown shader/mesh");
            return;
        }

        if (this._cgp.frameStore.branchProfiler) this._cgp.frameStore.branchStack.push("setPipeline");

        let needsRebuild =
            !this._renderPipeline ||
            !this._pipeCfg ||
            this._old.mesh != mesh ||
            this._old.shader != shader ||
            mesh.needsPipelineUpdate ||
            shader.needsPipelineUpdate;

        if (this._pipeCfg)
        {
            if (this._pipeCfg.depthStencil.depthWriteEnabled != this._cgp.stateDepthWrite())
            {
                needsRebuild = true;
                this._pipeCfg.depthStencil.depthWriteEnabled = this._cgp.stateDepthWrite();
            }

            if (this._cgp.stateDepthTest() === false)
            {
                if (this._pipeCfg.depthStencil.depthCompare != "never")
                {
                    this._pipeCfg.depthStencil.depthCompare = "never";
                    needsRebuild = true;
                }
            }
            else
            if (this._pipeCfg.depthStencil.depthCompare != this._cgp.stateDepthFunc())
            {
                needsRebuild = true;
                this._pipeCfg.depthStencil.depthCompare = this._cgp.stateDepthFunc();
            }

            if (this._pipeCfg.primitive.cullMode != this._cgp.stateCullFaceFacing())
            {
                needsRebuild = true;
                this._pipeCfg.primitive.cullMode = this._cgp.stateCullFaceFacing();
            }
        }

        this._cgp.currentPipeDebug =
        {
            "cfg": this._pipeCfg,
            "bindingGroupEntries": this.bindingGroupEntries,
            "bindingGroupLayoutEntries": this.bindingGroupLayoutEntries
        };
        if (needsRebuild)
        {
            this._cgp.pushErrorScope("createPipeline", { "logger": this._log });


            // if (!this._pipeCfg || this._old.shader != shader)
            this._pipeCfg = this.getPiplelineObject(shader, mesh);

            this._old.shader = shader;
            this._old.mesh = mesh;
            this._renderPipeline = this._cgp.device.createRenderPipeline(this._pipeCfg);



            this._cgp.popErrorScope();
        }
        this._bindUniforms(shader);

        if (this._renderPipeline && this._isValid)
        {
            this._cgp.pushErrorScope("setpipeline", { "logger": this._log });


            if (this._cgp.frameStore.branchProfiler) this._cgp.frameStore.branchStack.push("updateUniforms");

            if (this._cgp.frameStore.branchProfiler) this._cgp.frameStore.branchStack.pop();

            this._cgp.passEncoder.setPipeline(this._renderPipeline);

            if (this._bindGroup) this._cgp.passEncoder.setBindGroup(0, this._bindGroup);

            if (this._cgp.frameStore.branchProfiler) this._cgp.frameStore.branchStack.pop();

            this._cgp.popErrorScope();
        }

        shader.needsPipelineUpdate = false;
    }

    getPiplelineObject(shader, mesh)
    {
        this.bindingGroupEntries = [];
        this.bindingGroupLayoutEntries = [];


        for (let i = 0; i < shader.bindingsVert.length; i++)
        {
            if (shader.bindingsVert[i].getSizeBytes() > 0)
            {
                this.bindingGroupEntries.push(shader.bindingsVert[i].getBindingGroupEntry(this._cgp.device));
                this.bindingGroupLayoutEntries.push(shader.bindingsVert[i].getBindingGroupLayoutEntry());
            }
            else console.log("shader defaultBindingVert size 0");
        }

        for (let i = 0; i < shader.bindingsFrag.length; i++)
        {
            if (shader.bindingsFrag[i].getSizeBytes() > 0)
            {
                this.bindingGroupEntries.push(shader.bindingsFrag[i].getBindingGroupEntry(this._cgp.device));
                this.bindingGroupLayoutEntries.push(shader.bindingsFrag[i].getBindingGroupLayoutEntry());
            }
            else console.log("shader defaultBindingFrag size 0");
        }
        // //////////

        const bindGroupLayout = this._cgp.device.createBindGroupLayout(
            {
                "label": "label3",
                "entries": this.bindingGroupLayoutEntries,
            });
        // const bindGroupLayout = pipeline.getBindGroupLayout(0);

        // console.log(this.bindingGroupEntries);
        // console.log(this.bindingGroupLayoutEntries);

        if (!this.bindingGroupEntries) return console.warn("no bindingGroupEntries");

        const bg = {
            "label": "label2",
            "layout": bindGroupLayout,
            "entries": this.bindingGroupEntries
        };

        this._bindGroup = this._cgp.device.createBindGroup(bg);

        const pipelineLayout = this._cgp.device.createPipelineLayout({
            "label": "label1",
            "bindGroupLayouts": [
                bindGroupLayout,
            ]
        });

        const pipeCfg = {
            // "layout": "auto",
            "label": this._name,
            "layout": pipelineLayout,
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
                "cullMode": "back", // back/none/front

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
        this._cgp.pushErrorScope("pipeline bind uniforms", { "logger": this._log });

        shader.bind();

        for (let i = 0; i < shader.bindingsVert.length; i++)
            shader.bindingsVert[i].update(this._cgp);

        for (let i = 0; i < shader.bindingsFrag.length; i++)
            shader.bindingsFrag[i].update(this._cgp);

        // shader.defaultBindingVert.update(this._cgp);


        this._cgp.popErrorScope((e) =>
        {
            this._isValid = false;
        });
    }
}
