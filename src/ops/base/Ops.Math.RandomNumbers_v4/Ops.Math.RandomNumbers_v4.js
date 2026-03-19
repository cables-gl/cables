const
    inSeed = op.inValueFloat("Seed", 1),
    min = op.inValueFloat("Min", 0),
    max = op.inValueFloat("Max", 1),
    outRandoms = op.outMultiPort2("Random", CABLES.OP_PORT_TYPE_NUMBER, null, 4);

outRandoms.onChange =
inSeed.onChange =
    min.onChange =
    max.onChange = update;
update();

function update()
{
    const ports = outRandoms.get();
    const inMin = min.get();
    const inMax = max.get();
    Math.randomSeed = Math.abs(inSeed.get() || 0) * 571.1 + 1.0;

    for (let i = 0; i < ports.length; i++)
    {
        ports[i].set(Math.seededRandom() * (inMax - inMin) + inMin);
    }
}
