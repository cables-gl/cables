let exec = op.inTrigger("exec");
let next = op.outTrigger("next");

let outIndex = op.outValue("Index");

let outAttraction = op.outValue("Attraction");
let outRange = op.outValue("Range");

let cgl = op.patch.cgl;
let vec = vec3.create();

exec.onTriggered = function ()
{
    for (let j = 0; j < CABLES.forceFieldForces.length; j++)
    {
        cgl.pushModelMatrix();
        vec3.set(vec, CABLES.forceFieldForces[j].pos[0], CABLES.forceFieldForces[j].pos[1], CABLES.forceFieldForces[j].pos[2]);
        mat4.translate(cgl.mvMatrix, cgl.mvMatrix, vec);

        outIndex.set(j);
        outRange.set(CABLES.forceFieldForces[j].range);
        outAttraction.set(CABLES.forceFieldForces[j].attraction);

        next.trigger();
        cgl.popModelMatrix();
    }
};
