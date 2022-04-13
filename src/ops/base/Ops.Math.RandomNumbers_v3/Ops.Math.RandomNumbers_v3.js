const
    inSeed = op.inValueFloat("Seed", 1),
    min = op.inValueFloat("Min", 0),
    max = op.inValueFloat("Max", 1),
    outX = op.outNumber("X"),
    outY = op.outNumber("Y"),
    outZ = op.outNumber("Z"),
    outW = op.outNumber("W");

inSeed.onChange =
    min.onChange =
    max.onChange = update;
update();

function update()
{
    const inMin = min.get();
    const inMax = max.get();
    Math.randomSeed = Math.abs(inSeed.get() || 0) * 571.1 + 1.0;
    outX.set(Math.seededRandom() * (inMax - inMin) + inMin);
    outY.set(Math.seededRandom() * (inMax - inMin) + inMin);
    outZ.set(Math.seededRandom() * (inMax - inMin) + inMin);
    outW.set(Math.seededRandom() * (inMax - inMin) + inMin);
}
