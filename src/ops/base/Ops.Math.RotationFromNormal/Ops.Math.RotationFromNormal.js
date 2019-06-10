const inNormalX = op.inValue("Normal X");
const inNormalY = op.inValue("Normal Y");
const inNormalZ = op.inValue("Normal Z");
const inRecalculate = op.inTriggerButton("recalculate");

const outRotation = op.outArray("RotationMatrix");

const identMat = mat4.create();
const outMat = mat4.create();
const upVec = vec3.fromValues(0,1,0);
const tmpVec = vec3.create();
const tmpQuat = quat.create();

outRotation.set(identMat);

inRecalculate.onTriggered = function () {
    vec3.set(
        tmpVec,
        inNormalX.get(),
        inNormalY.get(),
        inNormalZ.get()
    );
    quat.identity(tmpQuat);
    quat.rotationTo(tmpQuat,upVec,tmpVec);
    mat4.fromQuat(outMat,tmpQuat);
    outRotation.set(identMat);
    outRotation.set(outMat);

};

