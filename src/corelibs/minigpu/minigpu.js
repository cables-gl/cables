export function createBindGroupLayout(mgpu, bindings)
{
    const layoutEntries = [];
    for (let i = 0; i < bindings.length; i++)
    {
        bindings[i].layout.binding = i;
        layoutEntries.push(bindings[i].layout);
    }
    const bindGroupLayout = mgpu.device.createBindGroupLayout({
        "entries": layoutEntries,
    });

    return bindGroupLayout;
}
export function createBindGroup(mgpu, bindings, bindGroupLayout)
{

    const bg = {
        "layout": bindGroupLayout,
        "entries": []
    };
    console.log("text");

    for (let i = 0; i < bindings.length; i++)
    {
        bg.entries.push(
            {
                "binding": i,
                "resource": bindings[i].resource
            }
        );
    }
    return mgpu.device.createBindGroup(bg);

}
