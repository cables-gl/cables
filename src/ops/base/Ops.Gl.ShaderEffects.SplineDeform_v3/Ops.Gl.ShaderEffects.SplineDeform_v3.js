const
    render = op.inTrigger("Render"),
    inPoints = op.inArray("Points", null, 3),
    inLoop = op.inBool("Loop", false),
    inMeshLength = op.inFloat("Mesh Length", 1),
    inStart = op.inFloat("Start", 0),
    inLength = op.inFloat("Length", 1),
    next = op.outTrigger("Next");

const cgl = op.patch.cgl;

const mod = new CGL.ShaderModifier(cgl, op.name, { "opId": op.id });
mod.addModule(
{
    "title": op.name,
    "name": "MODULE_VERTEX_POSITION",
    "srcHeadVert": attachments.splinedeform_head_vert,
    "srcBodyVert": attachments.splinedeform_vert
});

mod.addUniformVert("t", "MOD_tex", 0);
mod.addUniformVert("f", "MOD_numPoints", 0);
mod.addUniformVert("f", "MOD_meshLength", inMeshLength);
mod.addUniformVert("f", "MOD_start", inStart);
mod.addUniformVert("f", "MOD_length", inLength);

let tex = null;
let numPoints = 0;
let tooMany = false;
let needsUpdate = true;

inPoints.onChange = inLoop.onChange = () => { needsUpdate = true; };

render.onTriggered = () =>
{
    if (needsUpdate) update();

    if (tooMany) return;
    if (numPoints < 2)
    {
        next.trigger();
        return;
    }

    mod.bind();
    mod.pushTexture("MOD_tex", tex.tex);
    mod.setUniformValue("MOD_numPoints", numPoints);
    next.trigger();
    mod.unbind();
};

op.onDelete = () =>
{
    if (tex) tex.delete();
};

function update()
{
    needsUpdate = false;
    const points = inPoints.get();
    const loop = inLoop.get();
    mod.toggleDefine("MOD_LOOP", loop);

    numPoints = points ? Math.floor(points.length / 3) : 0;
    tooMany = numPoints > cgl.maxTexSize;
    if (tooMany) op.setUiError("toomany", "Too many points (" + numPoints + "), this GPU supports " + cgl.maxTexSize, 2);
    else op.setUiError("toomany", null);
    if (tooMany || numPoints < 2) return;

    const n = numPoints;
    const pos = (i) => [points[i * 3], points[i * 3 + 1], points[i * 3 + 2]];
    const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const scaleSub = (a, s, b) => [a[0] - s * b[0], a[1] - s * b[1], a[2] - s * b[2]];
    const normalize = (a) =>
    {
        const l = Math.sqrt(dot(a, a));
        return l > 0 ? [a[0] / l, a[1] / l, a[2] / l] : a;
    };

    const tangents = [];
    for (let i = 0; i < n; i++)
    {
        const prev = loop ? (i - 1 + n) % n : Math.max(i - 1, 0);
        const nxt = loop ? (i + 1) % n : Math.min(i + 1, n - 1);
        let t = normalize(sub(pos(nxt), pos(prev)));
        if (dot(t, t) == 0) t = i > 0 ? tangents[i - 1] : [1, 0, 0];
        tangents.push(t);
    }

    // rotation minimizing frames by double reflection (Wang et al. 2008)
    function transport(r, i0, i1)
    {
        const v1 = sub(pos(i1), pos(i0));
        const c1 = dot(v1, v1);
        if (c1 == 0) return r;
        const rL = scaleSub(r, 2 / c1 * dot(v1, r), v1);
        const tL = scaleSub(tangents[i0], 2 / c1 * dot(v1, tangents[i0]), v1);
        const v2 = sub(tangents[i1], tL);
        const c2 = dot(v2, v2);
        const r1 = c2 == 0 ? rL : scaleSub(rL, 2 / c2 * dot(v2, rL), v2);
        return normalize(scaleSub(r1, dot(r1, tangents[i1]), tangents[i1]));
    }

    const t0 = tangents[0];
    const a = Math.abs(t0[1]) < 0.99 ? [0, 1, 0] : [1, 0, 0];
    const ups = [normalize(scaleSub(a, dot(a, t0), t0))];
    for (let i = 1; i < n; i++) ups.push(transport(ups[i - 1], i - 1, i));

    if (loop)
    {
        // spread the twist between the last and first frame over the whole loop
        const rEnd = transport(ups[n - 1], n - 1, 0);
        const angle = Math.atan2(dot(cross(rEnd, ups[0]), t0), dot(rEnd, ups[0]));
        for (let i = 1; i < n; i++)
        {
            const ang = angle * i / n;
            const c = Math.cos(ang),
                s = Math.sin(ang);
            const r = ups[i],
                tr = cross(tangents[i], r);
            ups[i] = [r[0] * c + tr[0] * s, r[1] * c + tr[1] * s, r[2] * c + tr[2] * s];
        }
    }

    const data = new Float32Array(n * 3 * 4);
    for (let i = 0; i < n; i++)
    {
        data.set(pos(i), i * 4);
        data.set(tangents[i], (n + i) * 4);
        data.set(ups[i], (n * 2 + i) * 4);
    }

    if (!tex) tex = new CGL.Texture(cgl, { "isFloatingPointTexture": true, "flip": false, "name": "splinedeform" });
    tex.initFromData(data, n, 3, CGL.Texture.FILTER_NEAREST, CGL.Texture.WRAP_CLAMP_TO_EDGE);
}
