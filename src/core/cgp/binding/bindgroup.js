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
     * @param {string} name
     */
    constructor(cgp, name)
    {
        this.#cgp = cgp;
        this.name = name;
    }

    /**
     * @returns {GPUBindGroup}
     */
    get gpuBindgroup()
    {
        if (!this.#gpuBindGroup)
        {
            this.create();
        }
        // console.log(this.#gpuBindGroup);
        return this.#gpuBindGroup;
    }

    /**
     * @param {Binding} b
     * @returns {boolean}
     */
    hasBinding(b)
    {
        return this.#bindings.includes(b);
    }

    /**
     * @param {Binding} b
     * @returns {Binding}
     */
    addBinding(b)
    {
        b.bindNum = this.#bindings.length;
        this.#bindings.push(b);

        return b;
    }

    // /**
    //  * @param {CgpShader} shader
    //  */
    // bind(shader)
    // {
    //     shader.setBindgroup(this);
    // }

    getLayoutEntries()
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

    getLayout()
    {

        /** @type {GPUBindGroupLayout} */
        const bindGroupLayout = this.#cgp.device.createBindGroupLayout(
            {
                "label": "bindgrouplayout " + this.name,
                "entries": this.getLayoutEntries(),
            });

        return bindGroupLayout;
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

    updateValues()
    {
        for (let i = 0; i < this.#bindings.length; i++)
        {
            this.#bindings[i].updateValues();
        }
    }

    /**
     */
    bind()
    {

        if (!this.#gpuBindGroup) this.create();
        this.#cgp.passEncoder.setBindGroup(0, this.#gpuBindGroup);
    }
}
