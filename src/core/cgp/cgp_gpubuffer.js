import { EventTarget } from "../eventtarget.js";

export default class GPUBuffer extends EventTarget
{
    constructor(cgp, name, data = null, options = {})
    {
        super();

        this._name = name;
        this.floatArr = null;
        this.gpuBuffer = null;

        if (options.buffCfg)
        {
            this._buffCfg = options.buffCfg;
        }

        if (data)
        {
            this.setSize(data.length);
        }

        this.updateGpuBuffer(cgp);
    }

    setSize(s)
    {
        if (!this.floatArr || s != this.floatArr.length)
        {
            this.floatArr = new Float32Array(s);
        }
    }

    updateGpuBuffer(cgp)
    {
        if (cgp) this._cgp = cgp;
        if (!this._cgp || !this._cgp.device)
        {
            console.log("no cgp...", this._name, this._cgp);
            return;
        }
        if (!this.gpuBuffer)
        {
            this._buffCfg = this._buffCfg || {};
            this._buffCfg.label = "gpuBuffer-" + this._name;
            if (!this._buffCfg.hasOwnProperty("size") && this.floatArr) this._buffCfg.size = this.floatArr.length * 4;
            this._buffCfg.usage = this._buffCfg.usage || (GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE);

            this.gpuBuffer = this._cgp.device.createBuffer(this._buffCfg);

            console.log("this.gpuBuffer", this.gpuBuffer);
        }

        if (this.floatArr)
            this._cgp.device.queue.writeBuffer(
                this.gpuBuffer,
                0,
                this.floatArr.buffer,
                this.floatArr.byteOffset,
                this.floatArr.byteLength
            );
    }


    getSizeBytes()
    {
        return this.floatArr.length * 4;
    }

    dispose()
    {
        // todo
    }
}
