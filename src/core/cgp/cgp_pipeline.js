/// <reference types="@webgpu/types" />
import { Logger } from "cables-shared-client";
import { CgpContext } from "./cgp_state.js";
import { CgpShader } from "./cgp_shader.js";
import { CgpMesh } from "./cgp_mesh.js";

export class Pipeline
{
    static TYPE_RENDER = 0;
    static TYPE_COMPUTE = 1;

    #log = new Logger("pipeline");
    name = "";

    /** @type {CgpContext} */
    #cgp = null;
    #isValid = true;

    /** @type {string} */
    presentationFormat = null;

    /** @type {GPURenderPipelineDescriptor} */
    #pipeCfg = null;

    /** @type {GPUBindGroupLayout} */
    bindGroupLayout = null;

    /** @type {Array<string>} */
    #shaderListeners = [];
    #type = -1;
    lastRebuildReason = "first";
    rebuildCount = 0;
    profile = false;

    /** @type {Array<GPUBindGroupLayoutEntry>} */
    bindingGroupLayoutEntries = [];

    /**
     * Description
     * @param {CgpContext} _cgp
     * @param {String} name
     * @param {Number} type
     */
    constructor(_cgp, name, type = 0)
    {
        if (!_cgp) throw new Error("Pipeline constructed without cgp " + name);
        this.name = name;
        this.#cgp = _cgp;
        this.#type = type;

        // this.#cgp.on("deviceChange", () =>
        // {
        //     this.#renderPipeline = null;
        // });
    }

    get passEncoder()
    {
        return this.#cgp.passEncoder;
    }

    get log()
    {
        return this.#log;
    }

    get cgp()
    {
        return this.#cgp;
    }

    get isValid() { return this.#isValid; }

    /**
     * @param {String} name
     */
    setName(name)
    {
        this.name = name;
    }

    // setShaderListener(oldShader, newShader)
    // {
    //     for (let i = 0; i < this.#shaderListeners.length; i++) oldShader.off(this.#shaderListeners[i]);
    //     this.#shaderListeners = [];
    //     this.#shaderListeners.push(
    //         newShader.on("compiled", (/** @type {string} */ reason) =>
    //         {
    //             this.needsRebuildReason = "shader compiled: " + reason || "???";
    //         }));
    // }

    getInfo()
    {
        const info = {
            "class": this.constructor.name,
            "name": this.name,
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
            "name": this.name,
            "rebuildreason": this.lastRebuildReason,
            "rebuildCount": this.rebuildCount,
            "cfg": this.#pipeCfg,
            "bindingGroupLayoutEntries": this.bindingGroupLayoutEntries
        };
    }

    /**
     * @param {CgpShader} shader
     */
    _bindUniforms(shader)
    {
        shader.bind();
    }

    dispose()
    {
        // todo...
    }

}
