import { CgpShader } from "../cgp_shader.js";
import { CgpContext } from "../cgp_state.js";
import { Binding } from "./binding.js";

export class BindGroup
{

    /** @type {Array<GPUBindGroup>} */
    #gpuBindGroups = [];

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
    // get gpuBindgroup()
    // {
    //     if (!this.#gpuBindGroup)
    //     {
    //         this.create();
    //     }
    //     // console.log(this.#gpuBindGroup);
    //     return this.#gpuBindGroup;
    // }

    /**
     * @param {Binding} b
     * @returns {boolean}
     */
    hasBinding(b)
    {
        return this.#bindings.includes(b);
    }

    /**
     * @param {string} n
     * @returns {Binding}
     */
    getBindingByName(n)
    {

        for (let i = 0; i < this.#bindings.length; i++)
        {
            if (this.#bindings[i].name == n) return this.#bindings[i];
        }
    }

    /**
     * @param {Binding} b
     */
    removeBinding(b)
    {
        const idx = this.#bindings.indexOf(b);
        this.#bindings.splice(idx, 1);
    }

    /**
     * @param {Binding} b
     * @returns {Binding}
     */
    addBinding(b)
    {
        const oldBinding = this.getBindingByName(b.name);
        if (oldBinding) this.removeBinding(oldBinding);
        b.needsRebuildBindgroup = true;
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

    /**
     * @param {CgpShader} [shader]
     */
    getLayoutEntries(shader)
    {
        const arr = [];
        for (let i = 0; i < this.#bindings.length; i++)
        {
            arr.push(this.#bindings[i].getLayoutEntry(shader));
        }

        if (arr.length == 0)
        {
            // console.log("nooooooooooooooooooooooo");
        }
        return arr;
    }

    /**
     * @returns {Array<GPUBindGroupEntry>}
     * @param {number} inst
     */
    getEntries(inst)
    {
        const arr = [];
        for (let i = 0; i < this.#bindings.length; i++)
        {
            arr.push(this.#bindings[i].getBindgroupEntry(inst));
        }

        if (arr.length == 0)
        {
            // console.log("nooooooooooooooooooooooo");
        }
        return arr;
    }

    /**
     * @param {CgpShader} [shader]
     */
    getLayout(shader)
    {
        // console.log(this.getLayoutEntries(shader));

        /** @type {GPUBindGroupLayout} */
        const bindGroupLayout = this.#cgp.device.createBindGroupLayout(
            {
                "label": "bindgrouplayout " + this.name,
                "entries": this.getLayoutEntries(shader),
            });

        return bindGroupLayout;
    }

    /**
     * @param {number} inst
     */
    create(inst)
    {

        /** @type {GPUBindGroupDescriptor} */
        const bg = {
            "label": " " + this.name + " i" + inst,
            "layout": this.getLayout(),
            "entries": this.getEntries(inst)
        };

        this.#cgp.profileData.count("pipeline created", this.name);

        // if (bindingGroupEntries.length != this.bindingGroupLayoutEntries.length)
        // {
        //     this.#log.error("bindingGroupEntries.length!= this.bindingGroupLayoutEntries.length", bindingGroupEntries.length, this.bindingGroupLayoutEntries.length);
        //     this.#rebuildNumBindingGroups = true;
        //     this.#isValid = false;
        //     return;
        // }

        try
        {
            this.#gpuBindGroups[inst] = this.#cgp.device.createBindGroup(bg);

        }
        catch (e)
        {
            console.log(bg);
            console.error(e);
        }

        this.updateValues(inst);
    }

    /**
     * @param {number} inst
     */
    updateValues(inst)
    {
        for (let i = 0; i < this.#bindings.length; i++)
        {
            this.#bindings[i].updateValues(inst);
        }
    }

    /**
     * @param {number} inst
     * @param {GPURenderPassEncoder|GPUComputePassEncoder} passEnc
     */
    bind(inst = 0, passEnc = null, idx = 0)
    {
        for (let i = 0; i < this.#bindings.length; i++)
            if (this.#bindings[i].needsRebuildBindgroup)
            {
                // console.log("rebuild bg");
                this.create(inst);
                this.#bindings[i].needsRebuildBindgroup = false;
                this.#gpuBindGroups = [];
                // todo: dispose
            }

        if (!this.#gpuBindGroups[inst]) this.create(inst);
        (passEnc || this.#cgp.passEncoder).setBindGroup(idx, this.#gpuBindGroups[inst]);
    }

    /**
     * @param {CgpShader} shader
     * @param {number} idx
     */
    getShaderHeaderCode(shader, idx)
    {
        const srcs = { "vertex": "", "fragment": "", "compute": "" };

        this.#cgp.profileData.count("bindgroup shadercode", this.name);
        for (let i = 0; i < this.#bindings.length; i++)
        {
            const bind = this.#bindings[i];
            let src = "";
            src += bind.getShaderHeaderCode(shader, idx);
            if (bind.stage & GPUShaderStage.VERTEX)srcs.vertex += src;
            else if (bind.stage === GPUShaderStage.FRAGMENT)srcs.fragment += src;
            else if (bind.stage & GPUShaderStage.COMPUTE)srcs.compute += src;
        }

        return srcs;
    }

    /**
     * @param {CgpShader} shader
     */
    copy(shader)
    {
        const newBg = new BindGroup(this.#cgp, this.name);
        for (let i = 0; i < this.#bindings.length; i++)
        {
            newBg.addBinding(this.#bindings[i].copy(shader));
        }
        return newBg;
    }

    setBindingNums()
    {

        for (let i = 0; i < this.#bindings.length; i++)
        {
            this.#bindings[i].setBindNum(i);
        }
    }
}
