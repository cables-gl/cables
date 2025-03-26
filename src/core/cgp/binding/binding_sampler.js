import { CgpShader } from "../cgp_shader.js";
import { Binding } from "./binding.js";

/** @extends Binding */
export class BindingSampler extends Binding
{

    /** @type {GPUSamplerDescriptor} */
    smplDesc = {
        "addressModeU": "mirror-repeat",
        "addressModeV": "mirror-repeat",
        "magFilter": "linear",
        "minFilter": "linear",
        "mipmapFilter": "linear",
    };

    /** @type {GPUSampler} */
    sampler = null;

    constructor(cgp, name, options)
    {
        super(cgp, name, options);
        this.sampler = this.cgp.device.createSampler(this.smplDesc);

    }

    getResource()
    {
        return this.sampler;
    }

    /** @returns {GPUBindGroupLayoutEntry} */
    getLayoutEntry()
    {
        return {
            "visibility": this.stage,
            "binding": this.bindNum,
            "sampler": {}
        };
    }

    /**
     * @param {CgpShader} shader
     * @param {number} bindGroupNum
     */
    getShaderHeaderCode(shader, bindGroupNum)
    {
        let str = "@group(" + bindGroupNum + ") @binding(" + this.bindNum + ") ";
        str += "var " + this.name + ": sampler;".endl();
        return str;
    }
}
