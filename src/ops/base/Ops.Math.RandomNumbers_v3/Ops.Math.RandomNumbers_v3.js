const
    inSeed = op.inFloat("Seed", 1),
    min = op.inFloat("Min", 0),
    max = op.inFloat("Max", 1),
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
