let inX = op.inValue("X");
let inY = op.inValue("Y");

let outX = op.outValue("Result X");
let outY = op.outValue("Result Y");

inX.onChange = calc;
inY.onChange = calc;

let mat = mat4.create();

let cgl = op.patch.cgl;

let vm = null;
let pm = null;

function calc()
{
    pm = cgl.pMatrix;
    vm = cgl.vMatrix;

    let x = 2.0 * inX.get() / cgl.canvas.clientWidth - 1;
    let y = -2.0 * inY.get() / cgl.canvas.clientHeight + 1;

    let point3d = vec3.fromValues(x, y, 0);

    mat4.mul(mat, pm, vm);

    mat4.invert(mat, mat);

    vec3.transformMat4(point3d, point3d, mat);

    outX.set(point3d[0] * 10);
    outY.set(point3d[1] * 10);
}
