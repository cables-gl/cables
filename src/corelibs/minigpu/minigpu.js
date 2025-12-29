export function createBindGroupLayout(mgpu, bindings)
{
    console.log("bindings", bindings);
    const layoutEntries = [];
    for (let i = 0; i < bindings.length; i++)
    {
        bindings[i].layout.binding = i;
        layoutEntries.push(bindings[i].layout);
        console.log("iiii", bindings[i].layout);
    }
    const bindGroupLayout = mgpu.device.createBindGroupLayout({
        "entries": layoutEntries,
    });

    return bindGroupLayout;
}
export function createBindGroup(mgpu, bindings, bindGroupLayout)
{

    console.log("bindings", bindings);
    const bg = {
        "layout": bindGroupLayout,

        // "layout": 0,
        "entries": []
    };

    for (let i = 0; i < bindings.length; i++)
    {
        console.log("resourceeeeeeeeee", bindings[i].resource);
        bg.entries.push(
            {
                "binding": i,
                "resource": bindings[i].resource
                // "resource": { "buffer": s.bindings[i] },
            },
        );
    }
    console.log("ginnnnnnnnnnnnnnnnn", bg);
    return mgpu.device.createBindGroup(bg);

}
