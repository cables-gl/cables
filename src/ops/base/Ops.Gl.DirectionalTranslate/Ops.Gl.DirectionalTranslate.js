const
    exec = op.inTrigger("Exec"),
    inMatrix = op.inArray("Center Model Matrix"),
    inAmount = op.inValue("Amount"),
    next = op.outTrigger("Next");

const cgl = op.patch.cgl;

let va = vec3.create();
let vb = vec3.create();
let diff = vec3.create();
let mm = mat3.create();

exec.onTriggered = function ()
{
    let matbefore = inMatrix.get();
    if (!matbefore) return;

    mat4.getTranslation(va, matbefore);
    mat4.getTranslation(vb, cgl.modelMatrix());

    mat3.fromMat4(mm, cgl.modelMatrix());
    mat3.invert(mm, mm);

    vec3.sub(diff, vb, va);
    vec3.normalize(diff, diff);
    vec3.transformMat3(diff, diff, mm);
    vec3.normalize(diff, diff);

    diff[0] *= inAmount.get();
    diff[1] *= inAmount.get();
    diff[2] *= inAmount.get();

    cgl.pushModelMatrix();
    mat4.translate(cgl.mMatrix, cgl.mMatrix, diff);
    next.trigger();
    cgl.popModelMatrix();
};
