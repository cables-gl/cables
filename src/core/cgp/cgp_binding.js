import GPUBuffer from "./cgp_gpubuffer.js";

export default class Binding
{
    /**
     * Description
     * @param {any} cgp
     * @param {any} idx
     * @param {string} name
     * @param {any} options={}
     */
    constructor(cgp, idx, name, options = {})
    {
        this.idx = idx;
        this._name = name;
        this._cgp = cgp;
        this.uniforms = [];
        this.cGpuBuffer = null;

        this.shader = null;

        this.bindingInstances = [];
        this.stageStr = options.stage;
        this.bindingType = options.bindingType || "uniform"; // "uniform", "storage", "read-only-storage",

        this.stage = GPUShaderStage.VERTEX;
        if (this.stageStr == "frag") this.stage = GPUShaderStage.FRAGMENT;

        if (options.shader) this.shader = options.shader;

        this._buffer = null;
        this.isValid = true;
        this.changed = 0;

        if (options.shader)
        {
            if (this.stageStr == "frag") options.shader.bindingsFrag.push(this);
            if (this.stageStr == "vert") options.shader.bindingsVert.push(this);
        }

        this._cgp.on("deviceChange", () =>
        {
            // this.reInit();
        });
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
            o.buffer.type = this.bindingType;
        }

        return o;
    }

    getBindingGroupEntry(gpuDevice, inst)
    {
        this.isValid = false;

        const o = {
            "label": this._name + " binding",
            "binding": this.idx,
            "size": this.getSizeBytes(),
            "visibility": this.stage,
        };

        if (this.uniforms.length == 1 && this.uniforms[0].getType() == "t")
        {
            if (this.uniforms[0].getValue() && this.uniforms[0].getValue().gpuTexture) o.resource = this.uniforms[0].getValue().gpuTexture.createView();
            else o.resource = this._cgp.getEmptyTexture().createView();// CABLES.emptyCglTexture.createView();
        }
        else if (this.uniforms.length == 1 && this.uniforms[0].getType() == "sampler")
        {
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
            let buffCfg = {
                "label": this._name,
                "size": this.getSizeBytes(),
                "usage": GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
            };

            if (this.bindingType == "read-only-storage" || this.bindingType == "storage") buffCfg.usage = GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST;

            if (this.cGpuBuffer) this.cGpuBuffer.dispose();
            this.cGpuBuffer = new GPUBuffer(this._cgp, "buff", null, { "buffCfg": buffCfg });

            if (this.uniforms[0].gpuBuffer) this.cGpuBuffer = this.uniforms[0].gpuBuffer;

            o.resource = {
                "buffer": this.cGpuBuffer.gpuBuffer,
                "minBindingSize": this.getSizeBytes(),
                "hasDynamicOffset": 0
            };
        }

        this.isValid = true;
        this.bindingInstances[inst] = o;

        return o;
    }



    update(cgp, inst)
    {
        let b = this.bindingInstances[inst];
        if (!b) b = this.getBindingGroupEntry(cgp.device, inst);

        if (this.uniforms.length == 1 && this.uniforms[0].gpuBuffer)
        {
            // console.log("A", this.uniforms[0].gpuBuffer.gpuBuffer);

            // if (this.cGpuBuffer != this.uniforms[0].gpuBuffer)
            // {
            //     this.cGpuBuffer = this.uniforms[0].gpuBuffer;

            //     b.resource = {
            //         "buffer": this.uniforms[0].gpuBuffer.gpuBuffer,
            //         "minBindingSize": this.uniforms[0].gpuBuffer.getSizeBytes(),
            //         "hasDynamicOffset": 0
            //     };
            //     this.changed++;
            //     // this.shader._needsRecompile = true;
            // }

            if (this._cgp.frameStore.branchProfiler) this._cgp.frameStore.branchStack.push("extern uni bind", [this.uniforms[0].getName(), this.cGpuBuffer.floatArr]);
            if (this._cgp.frameStore.branchProfiler) this._cgp.frameStore.branchStack.pop();


            const s = this.getSizeBytes();
            // if (!this._buffer || s != this._buffer.length) this._buffer = new Float32Array(s);

            this.cGpuBuffer.setSize(s / 4);

            // console.log("xc", s);

            const commandEncoder = this._cgp.device.createCommandEncoder();
            // console.log(this.uniforms[0].gpuBuffer.gpuBuffer);
            // console.log("copyBufferToBuffer");

            this.cGpuBuffer.gpuBuffer.unmap();
            this.uniforms[0].gpuBuffer.gpuBuffer.unmap();
            commandEncoder.copyBufferToBuffer(
                this.uniforms[0].gpuBuffer.gpuBuffer, 0, this.cGpuBuffer.gpuBuffer, 0, this.getSizeBytes()
            );
            commandEncoder.finish();


            // console.log("A", this.uniforms[0].gpuBuffer.id);
        }
        else
        if (this.uniforms.length == 1 && this.uniforms[0].getType() == "t")
        {
            if (this._cgp.frameStore.branchProfiler) this._cgp.frameStore.branchStack.push("uni texture");
            if (this.uniforms[0].getValue())
                if (this.uniforms[0].getValue().gpuTexture)
                {
                    this.bindingInstances[inst] = this.getBindingGroupEntry(this.uniforms[0]._cgp.device, inst);
                }
                else
                {
                    b.resource = CABLES.errorTexture.createView();
                }

            if (this._cgp.frameStore.branchProfiler) this._cgp.frameStore.branchStack.pop();
        }
        else if (this.uniforms.length == 1 && this.uniforms[0].getType() == "sampler")
        {
            if (this._cgp.frameStore.branchProfiler) this._cgp.frameStore.branchStack.push("uni sampler");
            b.resource = this.uniforms[0].getValue();
            if (this._cgp.frameStore.branchProfiler) this._cgp.frameStore.branchStack.pop();
        }
        else
        {
            let info = ["stage " + this.stageStr + " / inst " + inst];

            // console.log("B",this.);


            // update uniform values to buffer
            const s = this.getSizeBytes() / 4;
            // if (!this._buffer || s != this._buffer.length) this._buffer = new Float32Array(s);

            this.cGpuBuffer.setSize(s);

            let off = 0;
            for (let i = 0; i < this.uniforms.length; i++)
            {
                info.push(this.uniforms[i].getName() + " " + this.uniforms[i].getValue());
                this.uniforms[i].copyToBuffer(this.cGpuBuffer.floatArr, off); // todo: check if uniform changed?
                off += this.uniforms[i].getSizeBytes() / 4;
            }
            if (this._cgp.frameStore.branchProfiler) this._cgp.frameStore.branchStack.push("uni buff", info);


            this.cGpuBuffer.updateGpuBuffer();
            // todo: only if changed...
            // cgp.device.queue.writeBuffer(
            //     b.resource.buffer,
            //     0,
            //     this._buffer.buffer,
            //     this._buffer.byteOffset,
            //     this._buffer.byteLength
            // );

            if (this._cgp.frameStore.branchProfiler) this._cgp.frameStore.branchStack.pop();
        }
    }
}
