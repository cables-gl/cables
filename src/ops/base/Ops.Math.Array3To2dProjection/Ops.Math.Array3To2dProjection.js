const
    exe = op.inTrigger("Exec"),
    inArr = op.inArray("Array3x"),
    fov = op.inValueFloat("fov", 45),
    w = op.inValueFloat("w", 1),
    h = op.inValueFloat("h", 1),
    px = op.inValueFloat("Pos X", -0.5),
    py = op.inValueFloat("Pos Y", -0.5),
    coordmul = op.inValueFloat("mul"),
    next = op.outTrigger("Next"),
    outArr = op.outArray("Array2x", [], 3);

exe.onTriggered = function ()
{
    // if (needsUpdate)
    update();
};

exe.onChange =
    inArr.onChange =
    fov.onChange =
    w.onChange =
    h.onChange =
    px.onChange =
    py.onChange =
    coordmul.onChange = update;

const cgl = op.patch.cgl;

let needsUpdate = false;

let minX = 9999999;
let maxX = -9999999;
let minY = 9999999;
let maxY = -9999999;

let pos = vec3.create();
let m = mat4.create();
let trans = vec3.create();
let pm = mat4.create();

function proj(p)
{
    pm = mat4.perspective(pm, fov.get() * CGL.DEG2RAD, 1, 0.0001, 100);

    mat4.multiply(m, cgl.vMatrix, cgl.mMatrix);
    vec3.transformMat4(pos, [px.get(), py.get(), 0], m);
    vec3.add(pos, pos, p);

    vec3.transformMat4(trans, pos, pm);

    let height = h.get();
    let width = w.get();
    let x = trans[0] * width;
    let y = trans[1] * height;

    return [x, y, 0];
}

inArr.onChange = function ()
{
    needsUpdate = true;
};

function update()
{
    let points3d = inArr.get();
    if (!points3d) return;

    let ind = 0;
    let laserArr = [];
    let point = vec3.create();

    for (let i = 0; i < points3d.length / 3; i++)
    {
        vec3.set(point,
            points3d[i * 3 + 0],
            points3d[i * 3 + 1],
            points3d[i * 3 + 2]
        );

        let vv = proj(point);

        let x = vv[0];
        let y = vv[1];
        if (x == null)x = 0;
        if (y == null)y = 0;

        x += w.get() / 2;
        y += h.get() / 2;

        minX = Math.min(x, minX);
        maxX = Math.max(x, maxX);

        minY = Math.min(y, minY);
        maxY = Math.max(y, maxY);

        laserArr[ind++] = x;
        laserArr[ind++] = y;
        laserArr[ind++] = 0;
    }

    outArr.setRef(laserArr);
    needsUpdate = false;

    next.trigger();
}
