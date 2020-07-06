const
    exec = op.inTrigger("Exec"),
    inBB = op.inObject("Boundings"),
    inActive = op.inBool("Active", true),
    inDraw = op.inBool("Draw", true),
    next = op.outTrigger("Next"),
    result = op.outBool("Visible"),

    cgl = op.patch.cgl,
    trans = vec3.create(),
    m = mat4.create(),
    pos = vec3.create(),
    identVec = vec3.create();

let
    vp = null,
    geom = null,
    mesh = null;


function isVisible(posi)
{
    // vec3.add(pos,pos,posi);
    vec3.transformMat4(pos, posi, m);

    vec3.transformMat4(trans, pos, cgl.pMatrix);


    const xp = (trans[0] * vp[2] / 2) + vp[2] / 2;
    const yp = (trans[1] * vp[3] / 2) + vp[3] / 2;

    return pos[2] < 0.0 && xp > 0 && xp < vp[2] && yp > 0 && yp < vp[3];
}

inBB.onChange = function ()
{
    mesh = null;
};

function buildMesh()
{
    const bb = inBB.get();
    if (!bb) return;
    geom = new CGL.Geometry();
    geom.vertices =
    [
        bb._max[0], bb._max[1], bb._max[2],
        bb._min[0], bb._max[1], bb._max[2],

        bb._min[0], bb._max[1], bb._max[2],
        bb._min[0], bb._min[1], bb._max[2],

        bb._min[0], bb._min[1], bb._max[2],
        bb._max[0], bb._min[1], bb._max[2],

        bb._max[0], bb._min[1], bb._max[2],
        bb._max[0], bb._max[1], bb._max[2],

        //

        bb._max[0], bb._max[1], bb._min[2],
        bb._min[0], bb._max[1], bb._min[2],

        bb._min[0], bb._max[1], bb._min[2],
        bb._min[0], bb._min[1], bb._min[2],

        bb._min[0], bb._min[1], bb._min[2],
        bb._max[0], bb._min[1], bb._min[2],

        bb._max[0], bb._min[1], bb._min[2],
        bb._max[0], bb._max[1], bb._min[2],

        //

        bb._max[0], bb._max[1], bb._min[2],
        bb._max[0], bb._max[1], bb._max[2],

        bb._min[0], bb._max[1], bb._min[2],
        bb._min[0], bb._max[1], bb._max[2],


        bb._max[0], bb._min[1], bb._min[2],
        bb._max[0], bb._min[1], bb._max[2],

        bb._min[0], bb._min[1], bb._min[2],
        bb._min[0], bb._min[1], bb._max[2],


        //

        bb._min[0], bb._min[1], bb._min[2],
        bb._max[0], bb._max[1], bb._max[2],

        bb._max[0], bb._min[1], bb._min[2],
        bb._min[0], bb._max[1], bb._max[2],

    ];

    mesh = new CGL.Mesh(cgl, geom, cgl.gl.LINES);
}


// LINE/LINE
function lineToScreen(posA, posB)
{
    vec3.transformMat4(pos, posA, m);
    vec3.transformMat4(trans, pos, cgl.pMatrix);

    const x1 = (trans[0] * vp[2] / 2) + vp[2] / 2;
    const y1 = (trans[1] * vp[3] / 2) + vp[3] / 2;

    vec3.transformMat4(pos, posB, m);
    vec3.transformMat4(trans, pos, cgl.pMatrix);

    const x2 = (trans[0] * vp[2] / 2) + vp[2] / 2;
    const y2 = (trans[1] * vp[3] / 2) + vp[3] / 2;


    const w = vp[2];
    const h = vp[3];

    return lineline(x1, y1, x2, y2, 0, 0, w, h) ||

        lineline(x1, y1, x2, y2, 0, 0, w, 0) ||
        lineline(x1, y1, x2, y2, 0, h, w, h) ||

        lineline(x1, y1, x2, y2, 0, 0, 0, h) ||
        lineline(x1, y1, x2, y2, w, 0, w, h);
}

function lineline(x1, y1, x2, y2, x3, y3, x4, y4)
{
    // calculate the direction of the lines
    const uA = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
    const uB = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));

    // if uA and uB are between 0-1, lines are colliding
    if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1)
    {
        // const intersectionX = x1 + (uA * (x2 - x1));
        // const intersectionY = y1 + (uA * (y2 - y1));

        return true;
    }
    return false;
}


exec.onTriggered = () =>
{
    if (!inActive.get()) return;
    const bb = inBB.get();
    if (!bb)
    {
        result.set(false);
        return;
    }

    if (inDraw.get())
    {
        if (!geom || !mesh) buildMesh();
        mesh.render(cgl.getShader());
    }

    vp = cgl.getViewPort();

    mat4.multiply(m, cgl.vMatrix, cgl.mMatrix);

    const isVis =

        isVisible(bb._center) ||

        lineToScreen(bb._max, bb._min) ||

        lineToScreen([bb._max[0], bb._max[1], bb._max[2]], [bb._min[0], bb._max[1], bb._max[2]]) ||
        lineToScreen([bb._min[0], bb._max[1], bb._max[2]], [bb._min[0], bb._min[1], bb._max[2]]) ||
        lineToScreen([bb._min[0], bb._min[1], bb._max[2]], [bb._max[0], bb._min[1], bb._max[2]]) ||
        lineToScreen([bb._max[0], bb._min[1], bb._max[2]], [bb._max[0], bb._max[1], bb._max[2]]) ||

        //

        lineToScreen([bb._max[0], bb._max[1], bb._min[2]], [bb._min[0], bb._max[1], bb._min[2]]) ||
        lineToScreen([bb._min[0], bb._max[1], bb._min[2]], [bb._min[0], bb._min[1], bb._min[2]]) ||
        lineToScreen([bb._min[0], bb._min[1], bb._min[2]], [bb._max[0], bb._min[1], bb._min[2]]) ||
        lineToScreen([bb._max[0], bb._min[1], bb._min[2]], [bb._max[0], bb._max[1], bb._min[2]]) ||

        //

        lineToScreen([bb._max[0], bb._max[1], bb._min[2]], [bb._max[0], bb._max[1], bb._max[2]]) ||
        lineToScreen([bb._min[0], bb._max[1], bb._min[2]], [bb._min[0], bb._max[1], bb._max[2]]) ||
        lineToScreen([bb._max[0], bb._min[1], bb._min[2]], [bb._max[0], bb._min[1], bb._max[2]]) ||
        lineToScreen([bb._min[0], bb._min[1], bb._min[2]], [bb._min[0], bb._min[1], bb._max[2]]);


    result.set(isVis);
    next.trigger();
};
