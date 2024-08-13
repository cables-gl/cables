let idx = op.inValueInt("Index");
let valuePorts = [];
let result = op.outString("Result");

idx.onChange = update;

for (let i = 0; i < 16; i++)
{
    let p = op.inUrl("File " + i);
    valuePorts.push(p);
    p.onChange = update;
}

function update()
{
    const index = idx.get();
    if (index >= 0 && valuePorts[index])
    {
        result.set(valuePorts[index].get());
    }
}
