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

    /**
     * Description
     * @param {CgpContext} cgp
     * @param {string} name
     * @param {object} options
     */
    constructor(cgp, name, options)
    {
        super(cgp, name, options);
        this.cgpbuffer = options.cgpBuffer || new CgpGguBuffer(cgp, "temp", [0, 0, 0, 0]);

        // if (this.bindingType == "read-write-storage") buffCfg.usage = GPUBufferUsage.MAP_WRITE | GPUBufferUsage.COPY_SRC;
        // else if (this.bindingType == "read-only-storage" || this.bindingType == "storage") buffCfg.usage = GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST;
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

    /** @returns {GPUBindGroupLayoutEntry} */
    getLayoutEntry()
    {
        return {
            "visibility": this.stage,
            "binding": this.bindNum,
            // "minBindingSize": this.getSizeBytes(),
            // "hasDynamicOffset": 0,
            "buffer": {

                "type": "read-only-storage" } };
    }

    /**
     * @param {CgpShader} shader
     * @param {number} bindGroupNum
     */
    getShaderHeaderCode(shader, bindGroupNum)
    {
        let str = "";

        str += "@group(" + bindGroupNum + ") ";
        str += "@binding(" + this.bindNum + ") ";
        str += "var<storage,read> ";
        // else if (this.bindingType == "read-write")str += "var<storage,read_write> ";
        // if (this.bindingType.includes("storage") && this.uniforms.length == 0)
        // {
        let typeStr = "array<f32>";
        // }
        str += this.name + ": " + typeStr + ";\n";

        return str + "\n";
    }
}
