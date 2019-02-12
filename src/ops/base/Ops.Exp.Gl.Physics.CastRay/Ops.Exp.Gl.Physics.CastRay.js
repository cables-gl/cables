const
    exec=op.inTrigger("Exec"),

    inX=op.inValueFloat("Screen X"),
    inY=op.inValueFloat("Screen Y"),
    inZ=op.inValueFloat("Screen Z"),


    next=op.outTrigger("Next"),

    hasHit=op.outValue("Has Hit"),
    hitX=op.outValue("Hit X"),
    hitY=op.outValue("Hit Y"),
    hitZ=op.outValue("Hit Z"),

    cgl=op.patch.cgl
    ;


exec.onTriggered=render;

var ray=new CANNON.Ray(
    new CANNON.Vec3(0,0,0),
    new CANNON.Vec3(0,0,0)
    );
var mat=mat4.create();

function setRay()
{
    var x = 2.0 * inX.get() / cgl.canvas.clientWidth - 1;
    var y = - 2.0 * inY.get() / cgl.canvas.clientHeight + 1;

    var origin=vec3.fromValues(x,y,0);
    mat4.mul(mat,cgl.pMatrix,cgl.vMatrix);
    mat4.invert(mat,mat);

    vec3.transformMat4(origin, origin, mat);

    // -----------

    var x = 2.0 * inX.get() / cgl.canvas.clientWidth - 1;
    var y = - 2.0 * inY.get() / cgl.canvas.clientHeight + 1;

    var to=vec3.fromValues(x,y,1);
    mat4.mul(mat,cgl.pMatrix,cgl.vMatrix);
    mat4.invert(mat,mat);

    vec3.transformMat4(to, to, mat);

    ray=new CANNON.Ray(
        new CANNON.Vec3(origin[0],origin[1],origin[2]),
        new CANNON.Vec3(to[0],to[1],to[2])
        );


}

function render()
{
    var world=cgl.frameStore.world;
    if(!world)return;

    setRay();

    var r=ray.intersectWorld(world,{});

    if(r && ray.result)
    {
        hasHit.set(ray.result.hasHit);

        hitX.set(ray.result.hitPointWorld.x);
        hitY.set(ray.result.hitPointWorld.y);
        hitZ.set(ray.result.hitPointWorld.z);
    }
    else hasHit.set(false);


}
