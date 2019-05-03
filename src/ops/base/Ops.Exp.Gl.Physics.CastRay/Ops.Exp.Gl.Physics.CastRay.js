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
    hitNormalX=op.outValue("Hit Normal X"),
    hitNormalY=op.outValue("Hit Normal Y"),
    hitNormalZ=op.outValue("Hit Normal Z"),
    hitResult=op.outObject("Result"),

    aabbX=op.outValue("aabb x"),
    aabbY=op.outValue("aabb y"),
    aabbZ=op.outValue("aabb z"),

    aabbX2=op.outValue("aabb x2"),
    aabbY2=op.outValue("aabb y2"),
    aabbZ2=op.outValue("aabb z2"),

    toX=op.outValue("to x"),
    toY=op.outValue("to y"),
    toZ=op.outValue("to z"),

    fromX=op.outValue("from x"),
    fromY=op.outValue("from y"),
    fromZ=op.outValue("from z"),

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
    mat4.identity(mat);
    // var x = 2.0 * (inX.get() / cgl.canvas.clientWidth) -1;
    // var y = - 2.0 * (inY.get() / cgl.canvas.clientHeight) +1;
    var x=inX.get();
    var y=inY.get();

    var origin=vec3.fromValues(x,y,0);
    mat4.mul(mat,cgl.pMatrix,cgl.vMatrix);
    mat4.invert(mat,mat);

    vec3.transformMat4(origin, origin, mat);

    // -----------

    var to=vec3.fromValues(x,y,1);
    mat4.mul(mat,cgl.pMatrix,cgl.vMatrix);
    mat4.invert(mat,mat);

    vec3.transformMat4(to, to, mat);

    var vx = origin[0] - to[0];
    var vy = origin[1] - to[1];
    var vz = origin[2] - to[2];

    var v3=vec3.create();
    vec3.set(v3,vx,vy,vz);
    vec3.normalize(v3,v3);
    vx=v3[0];
    vy=v3[1];
    vz=v3[2];
    // console.log(vx,vy,vz);

    const huge=99999;

    origin[0]=to[0]+vx*huge;
    origin[1]=to[1]+vy*huge;
    origin[2]=to[2]+vz*huge;

    to[0]-=vx*huge;
    to[1]-=vy*huge;
    to[2]-=vz*huge;

    ray=new CANNON.Ray(
        new CANNON.Vec3(to[0],to[1],to[2]),
        new CANNON.Vec3(origin[0],origin[1],origin[2])
        );

    fromX.set(origin[0]);
    fromY.set(origin[1]);
    fromZ.set(origin[2]);

    toX.set(to[0]);
    toY.set(to[1]);
    toZ.set(to[2]);
}

function render()
{
    var world=cgl.frameStore.world;
    if(!world)return;

    var hitBody=null;


    setRay();

    var r=ray.intersectWorld(world,{});

    if(r && ray.result)
    {
        // console.log(ray.result);
        // console.log(ray.result);
        hasHit.set(ray.result.hasHit);
        //ray.skipBackFaces = true;
        if(ray.result.body)
        {
            aabbX.set(ray.result.body.aabb.lowerBound.x);
            aabbX.set(ray.result.body.aabb.lowerBound.y);
            aabbX.set(ray.result.body.aabb.lowerBound.z);

            aabbX2.set(ray.result.body.aabb.upperBound.x);
            aabbX2.set(ray.result.body.aabb.upperBound.y);
            aabbX2.set(ray.result.body.aabb.upperBound.z);

            // ray.result.body.dispatchEvent({type:"raycasthit"});
            hitBody=ray.result.body;
            hitBody.raycastHit=true;

        }

        // console.log(ray.result);

        hitX.set(ray.result.hitPointWorld.x);
        hitY.set(ray.result.hitPointWorld.y);
        hitZ.set(ray.result.hitPointWorld.z);

        hitNormalX.set(ray.result.hitNormalWorld.x);
        hitNormalY.set(ray.result.hitNormalWorld.y);
        hitNormalZ.set(ray.result.hitNormalWorld.z);

    }
    else hasHit.set(false);
    hitResult.set(ray.result);


    for(var i=0;i<world.bodies.length;i++)
        if(world.bodies[i]!=hitBody)world.bodies[i].raycastHit=false;


    next.trigger();


}
