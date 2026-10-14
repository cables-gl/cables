const
    x = op.inFloat("X"),
    y = op.inFloat("Y"),
    z = op.inFloat("Z"),
    l = op.outNumber("Length");

x.onChange =
    y.onChange =
    z.onChange = update;

let vec = vec3.create();

function update()
{
    vec3.set(vec, x.get(), y.get(), z.get());
    l.set(vec3.len(vec));
}
