const
    exec=op.inTrigger("Exec"),
    inX=op.inValue("X"),
    inY=op.inValue("Y"),
    outTrigger = op.outTrigger("Trigger out"),
    outX=op.outValue("Result X"),
    outY=op.outValue("Result Y"),
    outZ=op.outValue("Result Z");

const mat=mat4.create();
const cgl=op.patch.cgl;

exec.onTriggered=calc;

function calc()
{
    var x = 2.0 * inX.get() / cgl.canvas.clientWidth - 1;
    var y = - 2.0 * inY.get() / cgl.canvas.clientHeight + 1;

    var point3d=vec3.fromValues(x,y,0);

    mat4.mul(mat,cgl.pMatrix,cgl.vMatrix);

    mat4.invert(mat,mat);

    vec3.transformMat4(point3d, point3d, mat);

    outX.set(point3d[0]*1);
    outY.set(point3d[1]*1);
    outZ.set(point3d[2]*1);

    outTrigger.trigger();
}
