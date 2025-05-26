import { CgpShader } from "../cgp_shader.js";
import { CgpContext } from "../cgp_state.js";
import { CgpUniform } from "../cgp_uniform.js";
import { Binding } from "./binding.js";

/** @extends {Binding} */
export class BindingTexture extends Binding
{

    /** @type {GPUSampler} */
    sampler = null;
    uniform = null;

    /**
     * @param {CgpContext} cgp
     * @param {string} name
     * @param {object} options
     */
    constructor(cgp, name, options)
    {
        super(cgp, name, options);

        /** @type {CgpUniform} */
        this.uniform = options.uniform;

        if (this.uniform.port)
        {
            this.uniform.port.on("change", () =>
            {
                this.needsRebuildBindgroup = true;
            });
        }

        console.log(this.uniform);
    }

    copy()
    {
        const b = new BindingTexture(this.cgp, this.name, this.options);
        return b;
    }

    getResource()
    {
        if (this.uniform.getValue() && this.uniform.getValue().gpuTexture) return this.uniform.getValue().gpuTexture.createView();
        else return this.cgp.getDefaultTexture().createView();
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

    /**
     * @param {CgpShader} _shader
     * @param {number} bindGroupNum
     */
    getShaderHeaderCode(_shader, bindGroupNum)
    {
        let str = "@group(" + bindGroupNum + ") @binding(" + this.bindNum + ") ";
        str += "var " + this.name + ": " + this.uniform.getWgslTypeStr() + ";\n";
        return str;
    }
}
