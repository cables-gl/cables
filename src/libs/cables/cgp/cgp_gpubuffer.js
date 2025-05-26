import { Events, Logger } from "cables-shared-client";
import { CgpContext } from "./cgp_state.js";

/** @typedef GPUBufferOptions
 * @property {number} [length]
 * @property {GPUBufferDescriptor} [buffCfg]
*/

export class CgpGguBuffer extends Events
{
    #name = "unknown";

    /** @type {CgpContext} */
    #cgp = null;

    /** @type {GPUBuffer} */
    #gpuBuffer = null;

    /** @type {GPUBufferDescriptor} */
    buffCfg = null;

    #length = 0;
    id = utils.shortId();
    floatArr = null;
    needsUpdate = true;
    #log;

    // static BINDINGTYPE_STORAGE = "storage";
    // static BINDINGTYPE_UNIFORM = "uniform";
    // static BINDINGTYPE_READONLY_STORAGE = "read-only-storage";

    /**
     * Description
     * @param {CgpContext} cgp
     * @param {String} name
     * @param {Array} data=null
     * @param {GPUBufferOptions} options={}
     */
    constructor(cgp, name, data = null, options = {})
    {
        super();
        this.#log = new Logger("cgpGpubuffer");
        if (!cgp.supported) return;

        this.#name = name;
        // this.setData([0, 0, 0, 0]);

        this.buffCfg = options.buffCfg || {};
        if (data) this.setData(data);
        if (options.length) this.setLength(options.length);

        this.buffCfg.usage = this.buffCfg.usage || (GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC);
        this.updateGpuBuffer(cgp);
    }

    /**
     * @param {Array} arr
     */
    setData(arr)
    {
        this.floatArr = new Float32Array(arr);
        this.setLength(this.floatArr.length);

        this.needsUpdate = true;
    }

    /**
     * @param {number} s
     */
    setLength(s)
    {
        this.#length = s;
        if (!this.floatArr || s != this.floatArr.length)
        {
            this.floatArr = new Float32Array(this.#length);
            this.needsUpdate = true;
        }
    }

    /**
     * @param {number} flag
     */
    hasUsage(flag)
    {
        return (this.buffCfg.usage & flag) === flag;
    }

    /** @param {CgpContext} cgp */
    updateGpuBuffer(cgp = null)
    {
        if (cgp) this.#cgp = cgp;
        if (!this.#cgp || !this.#cgp.device)
        {
            this.#log.warn("no cgp...", this.#name, this.#cgp);
            return;
        }

        this.#cgp.pushErrorScope("updateGpuBuffer");
        if (!this.#gpuBuffer || this.buffCfg.mappedAtCreation)
        {
            this.buffCfg = /** @type {GPUBufferDescriptor} */(this.buffCfg || {});
            this.buffCfg.label = "gpuBuffer-" + this.#name;
            if (!this.buffCfg.hasOwnProperty("size") && this.floatArr) this.buffCfg.size = this.floatArr.length * 4;

            this.#gpuBuffer = this.#cgp.device.createBuffer(this.buffCfg);
        }

        if (this.floatArr)
        {
            if (this.buffCfg.mappedAtCreation)
            {
                new Float32Array(this.#gpuBuffer.getMappedRange()).set(this.floatArr);
                this.#gpuBuffer.unmap();

            }
            else

                this.#cgp.device.queue.writeBuffer(
                    this.#gpuBuffer,
                    0,
                    this.floatArr.buffer,
                    this.floatArr.byteOffset,
                    this.floatArr.byteLength
                );
        }

        this.#cgp.popErrorScope();

        this.needsUpdate = false;
    }

    get name()
    {
        return this.#name;
    }

    /** @returns {GPUBuffer} */
    get gpuBuffer()
    {
        if (!this.#gpuBuffer || this.needsUpdate) this.updateGpuBuffer();

        return this.#gpuBuffer;
    }

    get length()
    {
        return this.#length;
    }

    getSizeBytes()
    {
        return this.floatArr.length * 4;
    }

    dispose()
    {
        // setTimeout(() =>
        // {
        //     if (this._gpuBuffer) this._gpuBuffer.destroy();
        // }, 100);
    }
}
