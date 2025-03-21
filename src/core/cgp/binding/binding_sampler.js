class BindingSampler
{
     smplDesc = {
        "addressModeU": "mirror-repeat",
        "addressModeV": "mirror-repeat",
        "magFilter": "linear",
        "minFilter": "linear",
        "mipmapFilter": "linear",
    };

    getResource()
    {
        if (this.uniforms[0].getValue())
        {
            if (!this.uniforms[0].getValue().getSampler)
            {
                this._log.error("uniform texture does not have function getSampler... not a WebGpu Texture?");
            }
            else
            {
                smplDesc = this.uniforms[0].getValue().getSampler();
                const sampler = this.#cgp.device.createSampler(smplDesc);
                if (sampler)o.resource = sampler;
            }
        }}
}
