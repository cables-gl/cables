const
    inExec = op.inTrigger("Exec"),
    inX1 = op.inFloat("X1", 0),
    inY1 = op.inFloat("Y1", 0),
    inZ1 = op.inFloat("Z1", 0),
    inX2 = op.inFloat("X2", 0),
    inY2 = op.inFloat("Y2", 0),
    inZ2 = op.inFloat("Z2", 0),
    next = op.outTrigger("Next"),
    outX = op.outNumber("X"),
    outY = op.outNumber("Y"),
    outZ = op.outNumber("Z");

const v1 = vec3.create();
const v2 = vec3.create();
const vR = vec3.create();

inExec.onTriggered = () =>
{
    v1.set([inX1.get(), inY1.get(), inZ1.get()]);
    v2.set([inX2.get(), inY2.get(), inZ2.get()]);

    vec3.cross(vR, v1, v2);

    outX.set(vR[0]);
    outY.set(vR[1]);
    outZ.set(vR[2]);

    next.trigger();
};
