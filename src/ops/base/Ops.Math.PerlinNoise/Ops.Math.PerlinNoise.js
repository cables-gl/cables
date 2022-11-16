const seed = op.inFloat("Seed", 1),
    x = op.inFloat("X"),
    y = op.inFloat("Y"),
    result = op.outNumber("Result");

x.onChange = y.onChange = seed.onChange = update;

function update()
{
    Math.randomSeed = seed.get();
    noise.seed(Math.seededRandom());

    result.set(noise.perlin2(x.get(), y.get()));
}
