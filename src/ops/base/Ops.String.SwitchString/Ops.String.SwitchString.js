const
    idx = op.inInt("Index"),
    result = op.outString("Result");

const valuePorts = [];

idx.onChange = update;

for (let i = 0; i < 10; i++)
{
    let p = op.inString("String " + i);
    valuePorts.push(p);
    p.onChange = update;
}

function update()
{
    if (idx.get() >= 0 && valuePorts[idx.get()])
    {
        result.set(valuePorts[idx.get()].get());
    }
}
