const
    exec = op.inTrigger("Exec"),
    inX = op.inValue("X"),
    inY = op.inValue("Y"),
    inputType = op.inSwitch("Input Type", ["Pixel", "-1 to 1"], "Pixel"),
    outTrigger = op.outTrigger("Trigger out"),
    outX = op.outNumber("Result X"),
    outY = op.outNumber("Result Y");

const mat = mat4.create();
const cgl = op.patch.cgl;

exec.onTriggered = calc;

let inp = 0;
inputType.onChange = () =>
{
    if (inputType.get() == "Pixel")inp = 0;
    else if (inputType.get() == "-1 to 1")inp = 1;
};

function calc()
{
    let x = 0;
    let y = 0;

    let aspect = cgl.canvas.clientWidth / cgl.canvas.clientHeight;

    if (inp === 0) // pixel
    {
        x = 2.0 * inX.get() / cgl.canvas.clientWidth - 1;
        y = -2.0 * inY.get() / cgl.canvas.clientHeight + 1;
    }
    else if (inp === 1) // -1 to 1
    {
        x = inX.get();
        y = inY.get();
    }

    let point3d = vec3.fromValues(x, y, 0);

    mat4.mul(mat, cgl.pMatrix, cgl.vMatrix);

    mat4.invert(mat, mat);

    vec3.transformMat4(point3d, point3d, mat);

    outX.set(point3d[0] * 10);
    outY.set(point3d[1] * 10);
    outTrigger.trigger();
}
