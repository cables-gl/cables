const
    exec = op.inTrigger("Update"),
    inX = op.inFloat("X", 0),
    inY = op.inFloat("Y", 0),
    inZ = op.inFloat("Z", 0),
    inMat = op.inArray("Matrix"),
    outX = op.outNumber("Result X"),
    outY = op.outNumber("Result Y"),
    outZ = op.outNumber("Result Z");

let theArr = [];
let vec = vec4.create();

exec.onTriggered = function ()
{
    const mMat = inMat.get();

    vec4.set(vec, inX.get(), inY.get(), inZ.get(), 1);

    // for (let i = 0; i < arr.length / 3; i++)
    // {
    //     vec[0] = arr[i * 3 + 0];
    //     vec[1] = arr[i * 3 + 1];
    //     vec[2] = arr[i * 3 + 2];

    vec3.transformMat4(vec, vec, mMat);

    //     theArr[i * 3 + 0] = vec[0];
    //     theArr[i * 3 + 1] = vec[1];
    //     theArr[i * 3 + 2] = vec[2];
    // }

    outX.set(vec[0]);
    outY.set(vec[1]);
    outZ.set(vec[2]);
};
