import { Binding } from "./binding.js";

export class BindingTexture extends Binding
{

    /** @type {GPUSampler} */
    sampler = null;

    uniform = null;

    constructor(cgp, name, options)
    {
        super(cgp, name, options);
        this.uniform = options.uniform;
    }

    getResource()
    {
        if (this.uniform.gpuTexture) return this.uniform.getValue().gpuTexture.createView();
        else return this.cgp.getEmptyTexture().createView();

    }

    /** @returns {GPUBindGroupLayoutEntry} */
    getLayoutEntry()
    {
        return {
            "visibility": this.stage,
            "binding": this.bindNum,
            "texture": {}
        };
    }
}
