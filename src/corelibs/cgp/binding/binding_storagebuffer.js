import { CgpGguBuffer } from "../cgp_gpubuffer.js";
import { CgpShader } from "../cgp_shader.js";
import { CgpContext } from "../cgp_state.js";
import { Binding } from "./binding.js";

/** @extends Binding */
export class BindingStorage extends Binding
{

    /** @type {CgpGguBuffer} */
    cgpbuffer = null;
    bindingType = "read-only-storage";
    type = "f32";

    /**
     * Description
     * @param {CgpContext} cgp
     * @param {string} name
     * @param {object} options
     */
    constructor(cgp, name, options)
    {
        super(cgp, name, options);
        if (options.type) this.type = options.type;
        this.cgpbuffer = options.cgpBuffer || new CgpGguBuffer(cgp, "temp", [0, 0, 0, 0]);
    }

    copy()
    {
        const b = new BindingStorage(this.cgp, this.name, this.options);
        return b;
    }

    /**
     * @returns {GPUBindingResource}
     * @param {number} _inst
     */
    getResource(_inst)
    {
        return {
            "buffer": this.cgpbuffer.gpuBuffer,
        };
    }

    /**
     * @returns {GPUBindGroupLayoutEntry}
     * @param {CgpShader} [_shader]
     */
    getLayoutEntry(_shader = null)
    {

        /** @type {GPUBufferBindingType} */
        let access = "read-only-storage";

        if (this.stage & GPUShaderStage.COMPUTE)
            if (this.cgpbuffer.hasUsage(GPUBufferUsage.COPY_SRC) && this.cgpbuffer.hasUsage(GPUBufferUsage.COPY_DST)) access = "storage";
        // else if (this.cgpbuffer.hasUsage(GPUBufferUsage.COPY_DST)) access = "write-only-storage";

        return {
            "visibility": this.stage,
            "binding": this.bindNum,
            // "minBindingSize": this.getSizeBytes(),
            // "hasDynamicOffset": 0,
            "buffer": {
                "type": access
            } };
    }

    /**
     * @param {CgpShader} _shader
     * @param {number} bindGroupNum
     */
    getShaderHeaderCode(_shader, bindGroupNum)
    {
        this.cgp.profileData.count("shadercode storage", this.name);
        let str = "";

        let access = "read";

        if (this.stage & GPUShaderStage.COMPUTE)
            if (this.cgpbuffer.hasUsage(GPUBufferUsage.COPY_SRC) && this.cgpbuffer.hasUsage(GPUBufferUsage.COPY_DST)) access = "read_write";
            else if (this.cgpbuffer.hasUsage(GPUBufferUsage.COPY_DST)) access = "write";

        str += "@group(" + bindGroupNum + ") ";
        str += "@binding(" + this.bindNum + ") ";

        str += "var<storage," + access + "> ";
        let typeStr = "array<" + this.type + ">";
        str += this.name + ": " + typeStr + ";\n";

        return str + "\n";
    }
}
