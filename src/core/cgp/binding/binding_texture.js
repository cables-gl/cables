import { CgContext } from "../../cg/cg_state.js";
import { CgpContext } from "../cgp_state.js";
import { CgpUniform } from "../cgp_uniform.js";
import { Binding } from "./binding.js";

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

    /**
     * @param {CgpShader} shader
     * @param {number} bindGroupNum
     */
    getShaderHeaderCode(shader, bindGroupNum)
    {
        let str = "@group(" + bindGroupNum + ") @binding(" + this.bindNum + ") ";
        str += "var " + this.name + ": " + this.uniform.getWgslTypeStr() + ";\n";
        return str;
    }
}
