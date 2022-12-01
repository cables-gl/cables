const
    exec = op.inTrigger("Update"),
    inX = op.inFloat("X", 0),
    inY = op.inFloat("Y", 0),
    inZ = op.inFloat("Z", 0),
    inMat = op.inArray("Matrix"),
    outNext = op.outTrigger("Next"),
    outX = op.outNumber("Result X"),
    outY = op.outNumber("Result Y"),
    outZ = op.outNumber("Result Z");

let theArr = [];
let vec = vec4.create();

exec.onTriggered = function ()
{
    const mMat = inMat.get();

    if (!mMat) return;

    vec4.set(vec, inX.get(), inY.get(), inZ.get(), 1);

    vec3.transformMat4(vec, vec, mMat);

    outX.set(vec[0]);
    outY.set(vec[1]);
    outZ.set(vec[2]);

    outNext.trigger();
};
