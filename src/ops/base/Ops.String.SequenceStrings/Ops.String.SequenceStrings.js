const outputs = [];
const inputs = [];

for (let i = 0; i < 16; i++)
{
    const inp = op.inString("String " + i, 0);
    const out = op.outString("Output " + i);

    inp.changeAlways = true;

    outputs.push(out);
    inputs.push(inp);
}

for (let i = 0; i < inputs.length; i++)
{
    const inp = inputs[i];
    // inp.onLinkChanged =
    inp.onChange = function ()
    {
        for (let j = 0; j < outputs.length; j++) outputs[j].set(inp.get());
    };
}
