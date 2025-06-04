const idx = op.inValueInt("Index");
const valuePorts = [];
const result = op.outNumber("Result");

idx.onChange = update;

for (let i = 0; i < 16; i++)
{
    let p = op.inValueFloat("Value " + i);
    valuePorts.push(p);
    p.onChange = update;
}

function update()
{
    const i = idx.get();
    if (i >= 0 && valuePorts[i])
    {
        result.set(valuePorts[i].get());
    }
}
