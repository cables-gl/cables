import { EventTarget } from "../eventtarget.js";

export default class GPUBuffer extends EventTarget
{
    constructor(cgp, name, data = null, options = {})
    {
        super();

        this._name = name;
        this.floatArr = null;
        this._gpuBuffer = null;

        this.setData([0, 0, 0, 0]);
        this.needsUpdate = true;

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

    setData(d)
    {
        this.floatArr = new Float32Array(d);
        this.needsUpdate = true;
    }

    setSize(s)
    {
        if (!this.floatArr || s != this.floatArr.length)
        {
            this.floatArr = new Float32Array(s);
            this.needsUpdate = true;
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
        if (!this._gpuBuffer)
        {
            this._buffCfg = this._buffCfg || {};
            this._buffCfg.label = "gpuBuffer-" + this._name;
            if (!this._buffCfg.hasOwnProperty("size") && this.floatArr) this._buffCfg.size = this.floatArr.length * 4;
            this._buffCfg.usage = this._buffCfg.usage || (GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE);

            this._gpuBuffer = this._cgp.device.createBuffer(this._buffCfg);

            console.log("this._gpuBuffer", this._gpuBuffer);
        }

        if (this.floatArr)
            this._cgp.device.queue.writeBuffer(
                this._gpuBuffer,
                0,
                this.floatArr.buffer,
                this.floatArr.byteOffset,
                this.floatArr.byteLength
            );

        this.needsUpdate = false;
    }

    get gpuBuffer()
    {
        if (!this._gpuBuffer || this.needsUpdate) this.updateGpuBuffer();

        return this._gpuBuffer;
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
