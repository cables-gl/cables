
export default class Binding
{
    constructor(idx, name, stage, options = {})
    {
        this.idx = idx;
        this._name = name;
        this.uniforms = [];
        this.bindingInstances = [];

        this.stage = GPUShaderStage.VERTEX;
        if (stage == "frag") this.stage = GPUShaderStage.FRAGMENT;

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
            o.texture = {};
        }
        else if (this.uniforms.length == 1 && this.uniforms[0].getType() == "sampler")
        {
            o.sampler = {};
        }
        else
        {
            o.buffer = {};
        }

        return o;
    }

    getBindingGroupEntry(gpuDevice, inst)
    {
        if (this.bindingInstances[inst] && this.bindingInstances[inst].resource && this.bindingInstances[inst].resource.buffer)
        {
            console.log("destroy");
            this.bindingInstances[inst].resource.buffer.destroy();
        }

        this.isValid = false;

        const o = {
            "label": this._name + " binding",
            "binding": this.idx,
            "size": this.getSizeBytes(),
            "visibility": this.stage,
        };

        if (this.uniforms.length == 1 && this.uniforms[0].getType() == "t")
        {
            if (this.uniforms[0].getValue())
            {
                if (this.uniforms[0].getValue().gpuTexture) o.resource = this.uniforms[0].getValue().gpuTexture.createView();
            }
            else o.resource = CABLES.emptyCglTexture.createView();// CABLES.emptyCglTexture.createView();
        }
        else if (this.uniforms.length == 1 && this.uniforms[0].getType() == "sampler")
        {
            // const sampler = this.uniforms[0]._cgp.device.createSampler();

            const sampler = this.uniforms[0]._cgp.device.createSampler({
                "addressModeU": "repeat",
                "addressModeV": "repeat",
                "magFilter": "linear",
                "minFilter": "linear",
                "mipmapFilter": "linear",
            });
            o.resource = sampler;
        }
        else
        {
            // this._gpuBuffer = null;
            // if (!this._gpuBuffer || this._gpuBuffer.size != this.getSizeBytes())

            const gpuBuffer = gpuDevice.createBuffer(
                {
                    "label": this._name,
                    "size": this.getSizeBytes(),
                    "usage": GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM
                });

            o.resource = {
                "buffer": gpuBuffer,
                "minBindingSize": this.getSizeBytes(),
                "hasDynamicOffset": 0
            };
        }

        this.isValid = true;
        this.bindingInstances[inst] = o;

        return o;
    }



    getShaderHeader()
    {
        // ????
    }

    update(cgp, inst)
    {
        // if (!this._gpuBuffer) return console.log("has no gpubuffer...");
        let b = this.bindingInstances[inst];
        if (!b) b = this.getBindingGroupEntry(cgp.device, inst);

        if (this.uniforms.length == 1 && this.uniforms[0].getType() == "t")
        {
            if (this.uniforms[0].getValue())
                if (this.uniforms[0].getValue().gpuTexture)
                {
                    this.bindingInstances[inst] = this.getBindingGroupEntry(this.uniforms[0]._cgp.device, inst);
                    // b.resource = this.uniforms[0].getValue().gpuTexture.createView();
                    // console.log(this.uniforms[0].getValue().width);
                    // console.log("yay");
                    // console.log("real tex...", this.uniforms[0].getValue());
                    // CABLES.errorTexture;
                    // b.resource = CABLES.errorTexture.createView();
                }
                else
                {
                    // console.log("fake tex...");
                    b.resource = CABLES.errorTexture.createView();
                }
            // console.log(1);


            // console.log("texture.....");
            // o.resource = CABLES.emptyCglTexture.createView();
            // if (this.uniforms.length == 1 && this.uniforms[0].getType() == "t")
            // {
            //     if (this.uniforms[0].getValue())
            //     {
            //         if (this.uniforms[0].getValue().gpuTexture) o.resource = this.uniforms[0].getValue().gpuTexture.createView();
            //     }
            //     else o.resource = CABLES.emptyCglTexture.createView();
            // }
            // else if (this.uniforms.length == 1 && this.uniforms[0].getType() == "sampler")
            // {
            //     const sampler = this.uniforms[0]._cgp.device.createSampler();

            //     o.resource = sampler;
            // }
        }
        else if (this.uniforms.length == 1 && this.uniforms[0].getType() == "sampler")
        {
            b.resource = this.uniforms[0].getValue();
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
                // if (this.uniforms[0].getType() == "m4")
                // {
                //     if (this.uniforms[i].getName() == "modelMatrix")
                // console.log(this.uniforms[i].getName(), this._buffer);
                // }
            }

            // console.log(this._buffer);

            // todo: only if changed...
            cgp.device.queue.writeBuffer(
                // this._gpuBuffer,
                b.resource.buffer,
                0,
                this._buffer.buffer,
                this._buffer.byteOffset,
                this._buffer.byteLength
            );
        }
    }
}
