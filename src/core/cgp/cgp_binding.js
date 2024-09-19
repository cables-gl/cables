
export default class Binding
{
    constructor(idx, name, stage, options = {})
    {
        this.idx = idx;
        this._name = name;
        this.stage = GPUShaderStage.VERTEX;
        if (stage == "frag") this.stage = GPUShaderStage.FRAGMENT;

        // this.stage = GPUShaderStage.FRAGMENT | GPUShaderStage.VERTEX; // why needed??

        this.uniforms = [];
        this._gpuBuffer = null;
        this._buffer = null;
        this.isValid = true;

        if (options.shader)
        {
            if (stage == "frag") options.shader.bindingsFrag.push(this);
            if (stage == "vert") options.shader.bindingsVert.push(this);
        }
    }

    addUniform(uni)
    {
        this.uniforms.push(uni);
    }

    getSizeBytes()
    {
        let size = 0;
        for (let i = 0; i < this.uniforms.length; i++)
        {
            // console.log("UNIFORM!!!", i, this.uniforms[i], this.uniforms[i].getSizeBytes());
            // console.log("getSizeBytes", this.uniforms[i], this.uniforms[i].getSizeBytes);
            size += this.uniforms[i].getSizeBytes();
        }
        // if (this.uniforms.length == 0)console.log("NO UNIFORMS!!!");
        return size;
    }


    getBindingGroupLayoutEntry()
    {
        let label = "layout " + this._name + " [";
        for (let i = 0; i < this.uniforms.length; i++)
            label += this.uniforms[i].getName() + ",";

        label += "]";

        const o = {
            "label": label,
            "binding": this.idx,
            "visibility": this.stage,
            "size": this.getSizeBytes()

        };

        if (this.uniforms.length == 1 && this.uniforms[0].getType() == "t")
        {
            o.texture = this.uniforms[0].getValue() || CABLES.emptyCglTexture;
        }
        else if (this.uniforms.length == 1 && this.uniforms[0].getType() == "sampler")
        {
            // const sampler = this.uniforms[0]._cgp.device.createSampler();
            const sampler = this.uniforms[0]._cgp.device.createSampler({
                "magFilter": "linear",
                "minFilter": "linear",
            });
            o.sampler = sampler;
        }
        else
        {
            o.buffer = this._gpuBuffer;
        }

        return o;
    }

    getBindingGroupEntry(gpuDevice)
    {
        this.checkBuffer(gpuDevice);

        this.isValid = false;

        const o = {
            "label": this._name + " binding",
            "binding": this.idx,
            "size": this.getSizeBytes(),
            "visibility": this.stage,
        };

        if (this.uniforms.length == 1 && this.uniforms[0].getType() == "t")
        {
            o.name = this.uniforms[0].getValue().name;
            o.width = this.uniforms[0].getValue().width;
            if (this.uniforms[0].getValue().gpuTexture) o.resource = this.uniforms[0].getValue().gpuTexture.createView();
            else o.resource = CABLES.emptyCglTexture.createView();
        }
        else if (this.uniforms.length == 1 && this.uniforms[0].getType() == "sampler")
        {
            const sampler = this.uniforms[0]._cgp.device.createSampler();

            o.resource = sampler;
        }
        else
            o.resource = { "buffer": this._gpuBuffer,
                "minBindingSize": this.getSizeBytes(),
                "hasDynamicOffset": 0,
            };

        this.isValid = true;

        return o;
    }

    checkBuffer(gpuDevice)
    {
        if (!this._gpuBuffer || this._gpuBuffer.size != this.getSizeBytes())
        {
            this._gpuBuffer = gpuDevice.createBuffer(
                {
                    "label": this._name,
                    "size": this.getSizeBytes(),
                    "usage": GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM
                });
        }
    }


    getShaderHeader()
    {
        // ????
    }

    update(cgp)
    {
        if (!this._gpuBuffer) return console.log("has no gpubuffer...");


        if (this.uniforms.length == 1 && this.uniforms[0].getType() == "t")
        {
        }
        else if (this.uniforms.length == 1 && this.uniforms[0].getType() == "sampler")
        {

        }
        else
        {
            // update uniform values to buffer
            const s = this.getSizeBytes() / 4;
            if (!this._buffer || s != this._buffer.length) this._buffer = new Float32Array(s);

            let off = 0;
            for (let i = 0; i < this.uniforms.length; i++)
            {
                this.uniforms[i].copyToBuffer(this._buffer, off); // todo: check if uniform changed?
                off += this.uniforms[i].getSizeBytes() / 4;
            }

            // todo: only if changed...
            cgp.device.queue.writeBuffer(
                this._gpuBuffer,
                0,
                this._buffer.buffer,
                this._buffer.byteOffset,
                this._buffer.byteLength
            );
        }
    }
}
