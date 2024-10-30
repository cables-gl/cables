let idx = op.inValueInt("Index");
let valuePorts = [];
let result = op.outArray("Result");

idx.onChange = update;

for (let i = 0; i < 10; i++)
{
    let p = op.inArray("Array " + i);
    valuePorts.push(p);
    p.onChange = update;
}

function update()
{
    if (idx.get() >= 0 && valuePorts[idx.get()] && valuePorts[idx.get()].isLinked())
    {
        result.setRef(valuePorts[idx.get()].get());
    }
    else
        result.setRef([]);
}
