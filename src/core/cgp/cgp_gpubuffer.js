import { Events } from "cables-shared-client";
import { WebGpuContext } from "./cgp_state.js";

/** GPUBuffer */
export default class GPUBuffer extends Events
{
    #name = "unknown";
    #gpuBuffer = null;
    #length = 0;
    id = CABLES.shortId();
    floatArr = null;
    needsUpdate = true;
    presentationFormat = null;

    /**
     * Description
     * @param {WebGpuContext} cgp
     * @param {String} name
     * @param {Array} data=null
     * @param {Object} options={}
     */
    constructor(cgp, name, data = null, options = {})
    {
        super();
        if (!cgp.supported) return;

        this.#name = name;
        this.setData([0, 0, 0, 0]);

        if (options.buffCfg) this._buffCfg = options.buffCfg;
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
            console.log("no cgp...", this.#name, this._cgp);
            return;
        }

        this._cgp.pushErrorScope("updateGpuBuffer");
        if (!this.#gpuBuffer)
        {
            this._buffCfg = this._buffCfg || {};
            this._buffCfg.label = "gpuBuffer-" + this.#name;
            if (!this._buffCfg.hasOwnProperty("size") && this.floatArr) this._buffCfg.size = this.floatArr.length * 4;
            this._buffCfg.usage = this._buffCfg.usage || (GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC);

            this.#gpuBuffer = this._cgp.device.createBuffer(this._buffCfg);
        }

        // if (!isNaN(this.floatArr[0]))console.log("shit", this.#name);

        if (this.floatArr)
            this._cgp.device.queue.writeBuffer(
                this.#gpuBuffer,
                0,
                this.floatArr.buffer,
                this.floatArr.byteOffset,
                this.floatArr.byteLength
            );

        // this._gpuBuffer.unmap();

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
