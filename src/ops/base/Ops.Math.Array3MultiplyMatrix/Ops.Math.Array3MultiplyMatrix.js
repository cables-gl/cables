const
    exec = op.inTrigger("Update"),
    inArr = op.inArray("Array", null, 3),
    inMat = op.inArray("Matrix", null, 16),
    next = op.outTrigger("Next"),
    outArr = op.outArray("Result", null, 3);

let theArr = [];
exec.onTriggered = function ()
{

    let mMat = inMat.get();
    let arr = inArr.get();
    if (!arr || !mMat)
    {
        outArr.set(null);
        return;
    }
    theArr.length = arr.length;
    let vec = vec4.create();
    vec[3] = 1;

    for (let i = 0; i < arr.length / 3; i++)
    {
        vec[0] = arr[i * 3 + 0];
        vec[1] = arr[i * 3 + 1];
        vec[2] = arr[i * 3 + 2];

        vec3.transformMat4(vec, vec, mMat);

        theArr[i * 3 + 0] = vec[0];
        theArr[i * 3 + 1] = vec[1];
        theArr[i * 3 + 2] = vec[2];
    }

    outArr.setRef(theArr);
    next.trigger();

};
