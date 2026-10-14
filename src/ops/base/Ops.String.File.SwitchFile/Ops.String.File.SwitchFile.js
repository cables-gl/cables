let idx = op.inInt("Index");
let valuePorts = [];
let result = op.outNumber("Result");

idx.onChange = update;

for (let i = 0; i < 10; i++)
{
    let p = op.inFile("File " + i);
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
