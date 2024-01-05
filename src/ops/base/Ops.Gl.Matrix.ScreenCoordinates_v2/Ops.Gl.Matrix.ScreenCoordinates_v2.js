const
    exec = op.inTrigger("Execute"),
    inUnit = op.inSwitch("Pixel Unit", ["Display", "CSS"], "Display"),
    trigger = op.outTrigger("Trigger"),
    x = op.outNumber("X"),
    y = op.outNumber("Y"),
    visi = op.outNumber("Visible");

const cgl = op.patch.cgl;
const trans = vec3.create();
const m = mat4.create();
const pos = vec3.create();
const identVec = vec3.create();
let div = -1;
inUnit.onChange = updateUnit;
updateUnit();

cgl.on("resize", updateUnit);

function updateUnit()
{
    if (inUnit.get() == "CSS")div = cgl.pixelDensity;
    else div = 1;
}

exec.onTriggered = function ()
{
    if (div == -1)updateUnit();
    mat4.multiply(m, cgl.vMatrix, cgl.mMatrix);

    vec3.transformMat4(pos, identVec, m);
    vec3.transformMat4(trans, pos, cgl.pMatrix);

    const vp = cgl.getViewPort();
    const xp = (trans[0] * vp[2] / 2) + vp[2] / 2;
    const yp = (trans[1] * vp[3] / 2) + vp[3] / 2;

    visi.set(pos[2] < 0.0 && xp > 0 && xp < vp[2] && yp > 0 && yp < vp[3]);

    x.set(xp / div);
    y.set(vp[3] / div - yp / div);

    trigger.trigger();
};
