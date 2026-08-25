export function createBindGroupLayout(mgpu, bindings)
{
    const layoutEntries = [];
    for (let i = 0; i < bindings.length; i++)
    {
        // bindings[i].layout = {};
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

    let bgg = null;

    if (!bg.entries)
    {
        console.log("no bindgroup entries");
        return null;

    }
    bgg = mgpu.device.createBindGroup(bg);
    return bgg;
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
