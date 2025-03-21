import { CgpShader } from "../cgp_shader.js";
import { CgpContext } from "../cgp_state.js";
import { Binding } from "./binding.js";

export class BindGroup
{

    /** @type {GPUBindGroup} */
    #gpuBindGroup = null;

    /** @type {Array<Binding>} */
    #bindings = [];

    name = "";

    bla = 1;

    /** @type {CgpContext} */
    #cgp;

    /**
     * @param {CgpContext} cgp
     */
    constructor(cgp)
    {
        this.#cgp = cgp;
    }

    /**
     * @returns {GPUBindGroup}
     */
    get gpuBindGroup()
    {
        return this.gpuBindGroup;
    }

    /**
     * @param {any} b
     */
    addBinding(b)
    {
        this.#bindings.push(b);
    }

    /**
     * @param {CgpShader} shader
     */
    bind(shader)
    {
        shader.setBindgroup(this);
    }

    /**
     * @returns {Array<GPUBindGroupLayoutEntry>}
     */
    getLayout()
    {
        const arr = [];
        for (let i = 0; i < this.#bindings.length; i++)
        {
            arr.push(this.#bindings[i].getLayoutEntry());
        }

        return arr;
    }

    /**
     * @returns {Array<GPUBindGroupEntry>}
     */
    getEntries()
    {
        const arr = [];
        for (let i = 0; i < this.#bindings.length; i++)
        {
            arr.push(this.#bindings[i].getBindgroupEntry());
        }

        return arr;
    }

    create()
    {

        /** @type {GPUBindGroupDescriptor} */
        const bg = {
            "label": " " + this.name,
            "layout": this.getLayout(),
            "entries": this.getEntries()
        };

        // if (bindingGroupEntries.length != this.bindingGroupLayoutEntries.length)
        // {
        //     this.#log.error("bindingGroupEntries.length!= this.bindingGroupLayoutEntries.length", bindingGroupEntries.length, this.bindingGroupLayoutEntries.length);
        //     this.#rebuildNumBindingGroups = true;
        //     this.#isValid = false;
        //     return;
        // }

        try
        {
            this.#gpuBindGroup = this.#cgp.device.createBindGroup(bg);

        }
        catch (e)
        {
            console.log(bg);
            console.error(e);
        }

    }
}
