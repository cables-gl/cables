noise.seed(Math.random());

var x=op.inValue("X");
var y=op.inValue("Y");

var result=op.outValue("Result");

x.onChange=update;
y.onChange=update;

function update()
{
    result.set(noise.perlin2(x.get(),y.get()));
}

