import { Events, Logger } from "cables-shared-client";
import { WebGpuContext } from "./cgp_state.js";

/** @typedef GPUBufferOptions
 * @property {number} length
 * @property {GPUBufferDescriptor} [buffCfg]
*/

export default class GPUBuffer extends Events
{
    #name = "unknown";

    /** @type {GPUBuffer} */
    #gpuBuffer = null;

    /** @type {GPUBufferDescriptor} */
    buffCfg = null;

    #length = 0;
    id = CABLES.shortId();
    floatArr = null;
    needsUpdate = true;
    #log;
    // presentationFormat = null;

    /**
     * Description
     * @param {WebGpuContext} cgp
     * @param {String} name
     * @param {Array} data=null
     * @param {GPUBufferOptions} options={}
     */
    constructor(cgp, name, data = null, options = null)
    {
        super();
        this.#log = new Logger("cgpGpubuffer");
        if (!cgp.supported) return;

        this.#name = name;
        this.setData([0, 0, 0, 0]);

        if (options.buffCfg) this.buffCfg = options.buffCfg;
        if (data) this.setData(data);
        if (options.length) this.setLength(options.length);

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

    updateGpuBuffer(cgp)
    {
        if (cgp) this._cgp = cgp;
        if (!this._cgp || !this._cgp.device)
        {
            this.#log.warn.log("no cgp...", this.#name, this._cgp);
            return;
        }

        this._cgp.pushErrorScope("updateGpuBuffer");
        if (!this.#gpuBuffer)
        {

            this.buffCfg = this.buffCfg || {};
            this.buffCfg.label = "gpuBuffer-" + this.#name;
            if (!this.buffCfg.hasOwnProperty("size") && this.floatArr) this.buffCfg.size = this.floatArr.length * 4;
            this.buffCfg.usage = this.buffCfg.usage || (GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC);

            this.#gpuBuffer = this._cgp.device.createBuffer(this.buffCfg);
        }

        if (this.floatArr)
            this._cgp.device.queue.writeBuffer(
                this.#gpuBuffer,
                0,
                this.floatArr.buffer,
                this.floatArr.byteOffset,
                this.floatArr.byteLength
            );

        this._cgp.popErrorScope();

        this.needsUpdate = false;
    }

    get name()
    {
        return this.#name;
    }

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
