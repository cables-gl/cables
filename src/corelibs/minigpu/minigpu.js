export function createBindGroupLayout(mgpu, bindings)
{
    const layoutEntries = [];
    for (let i = 0; i < bindings.length; i++)
    {
        bindings[i].layout.binding = i;
        layoutEntries.push(bindings[i].layout);
    }
    const bindGroupLayout = mgpu.device.createBindGroupLayout({
        "entries": layoutEntries
    });

    return bindGroupLayout;
}

export function createBindGroup(mgpu, bindings, bindGroupLayout)
{
    const bg = {
        "layout": bindGroupLayout,
        "entries": []
    };

    for (let i = 0; i < bindings.length; i++)
    {
        const b =
            {
                "binding": i
            };

        if (bindings[i].resource)b.resource = bindings[i].resource;
        bg.entries.push(b);
    }

    return mgpu.device.createBindGroup(bg);
}

export function getEmptyTexture(mgpu)
{

    return mgpu.device.createTexture(
        {
            "size": [2, 2],
            // "format": "rgba8uint",
            "format": mgpu.format,
            "usage": GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
        });

}
