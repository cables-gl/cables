const
    exec=op.inTrigger("Exec"),
    inBB=op.inObject("Boundings"),
    inActive=op.inBool("Active",true),
    inDraw=op.inBool("Draw",true),
    next=op.outTrigger("Next"),
    result=op.outBool("Visible"),

    cgl = op.patch.cgl,
    trans = vec3.create(),
    m = mat4.create(),
    pos = vec3.create(),
    identVec = vec3.create();

let
    geom=null,
    mesh=null;


function isVisible(posi)
{
    // vec3.add(pos,pos,posi);
    vec3.transformMat4(pos, posi, m);

    vec3.transformMat4(trans, pos, cgl.pMatrix);

    const vp = cgl.getViewPort();

    const xp = (trans[0] * vp[2] / 2) + vp[2] / 2;
    const yp = (trans[1] * vp[3] / 2) + vp[3] / 2;

    return pos[2] < 0.0 && xp > 0 && xp < vp[2] && yp > 0 && yp < vp[3];
}

inBB.onChange=function()
{
    mesh=null;
};

function buildMesh()
{
    const bb=inBB.get();
    if(!bb)return;
    geom=new CGL.Geometry();
    geom.vertices=
    [
        bb._max[0],bb._max[1],bb._max[2],
        bb._min[0],bb._max[1],bb._max[2],

        bb._min[0],bb._max[1],bb._max[2],
        bb._min[0],bb._min[1],bb._max[2],

        bb._min[0],bb._min[1],bb._max[2],
        bb._max[0],bb._min[1],bb._max[2],

        bb._max[0],bb._min[1],bb._max[2],
        bb._max[0],bb._max[1],bb._max[2],

        //

        bb._max[0],bb._max[1],bb._min[2],
        bb._min[0],bb._max[1],bb._min[2],

        bb._min[0],bb._max[1],bb._min[2],
        bb._min[0],bb._min[1],bb._min[2],

        bb._min[0],bb._min[1],bb._min[2],
        bb._max[0],bb._min[1],bb._min[2],

        bb._max[0],bb._min[1],bb._min[2],
        bb._max[0],bb._max[1],bb._min[2],

        //

        bb._max[0],bb._max[1],bb._min[2],
        bb._max[0],bb._max[1],bb._max[2],

        bb._min[0],bb._max[1],bb._min[2],
        bb._min[0],bb._max[1],bb._max[2],


        bb._max[0],bb._min[1],bb._min[2],
        bb._max[0],bb._min[1],bb._max[2],

        bb._min[0],bb._min[1],bb._min[2],
        bb._min[0],bb._min[1],bb._max[2],

    ];

    mesh=new CGL.Mesh(cgl,geom,cgl.gl.LINES);
}



exec.onTriggered=()=>
{
    if(!inActive.get())return;
    const bb=inBB.get();
    if(!bb)
    {
        result.set(false);
        return;
    }

    if(inDraw.get())
    {
        if(!geom || !mesh) buildMesh();
        mesh.render(cgl.getShader());
    }

    mat4.multiply(m, cgl.vMatrix, cgl.mMatrix);

    const isVis=
    // isVisible(bb._center) ||

        isVisible([bb._max[0],bb._max[1],bb._max[2]]) ||
        isVisible([bb._max[0],bb._min[1],bb._max[2]]) ||
        isVisible([bb._min[0],bb._min[1],bb._max[2]]) ||
        isVisible([bb._min[0],bb._max[1],bb._max[2]]) ||

        isVisible([bb._max[0],bb._max[1],bb._min[2]]) ||
        isVisible([bb._max[0],bb._min[1],bb._min[2]]) ||
        isVisible([bb._min[0],bb._min[1],bb._min[2]]) ||
        isVisible([bb._min[0],bb._max[1],bb._min[2]])
        ;

    result.set(isVis);
    next.trigger();
};