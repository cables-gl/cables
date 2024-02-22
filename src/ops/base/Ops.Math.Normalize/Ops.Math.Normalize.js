const
    inX = op.inFloat("X", 0),
    inY = op.inFloat("Y", 0),
    inZ = op.inFloat("Z", 0),
    outX = op.outNumber("Result X"),
    outY = op.outNumber("Result Y"),
    outZ = op.outNumber("Result Z");

const vec = vec3.create();

inX.onChange =
inY.onChange =
inZ.onChange = () =>
{
    vec3.set(vec, inX.get(), inY.get(), inZ.get());
    vec3.normalize(vec, vec);
    outX.set(vec[0]);
    outY.set(vec[1]);
    outZ.set(vec[2]);
};
