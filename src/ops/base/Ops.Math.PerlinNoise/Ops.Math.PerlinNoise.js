const seed = op.inFloatSlider("Seed",0),
    x=op.inValue("X"),
    y=op.inValue("Y"),
    result=op.outValue("Result");

seed.set(Math.random());

x.onChange=update;
y.onChange=update;
seed.onChange = update;

function update()
{
    Math.randomSeed=seed.get();
    noise.seed(Math.seededRandom());

    result.set(noise.perlin2(x.get(),y.get()));
}