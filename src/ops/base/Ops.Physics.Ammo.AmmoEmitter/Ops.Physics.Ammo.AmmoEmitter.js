const
    inExec=op.inTrigger("Exec"),
    inNum=op.inInt("Maximum Number Bodies",10),


    inRadius=op.inFloat("Radius",1),
    inMass=op.inFloat("Mass",1),

    inFriction = op.inFloat("Friction", 0.5),
    inRollingFriction = op.inFloat("Rolling Friction", 0.5),
    inRestitution = op.inFloat("Restitution", 0.5),

    inDirX=op.inFloat("Dir X"),
    inDirY=op.inFloat("Dir Y"),
    inDirZ=op.inFloat("Dir Z"),
    inSpeed=op.inFloat("Speed"),


    inSpawn=op.inTriggerButton("Spawn One"),
    inRemove=op.inTriggerButton("Remove All"),
    inRemoveFalling=op.inBool("Remove Y<-100",true),
    // inLifeTime=op.inFloat("Lifetime",0),

    next=op.outTrigger("Next");

let shouldspawnOne=false;
inSpawn.onTriggered=()=>{shouldspawnOne=true;};

const bodies=[];
const cgl=op.patch.cgl;

let world=null;
let tmpTrans = null;
let btVelocity=null;

inRemove.onTriggered=removeAll;

inExec.onLinkChanged=
    op.onDelete=removeAll;


function removeAll()
{
    for(let i=0;i<bodies.length;i++)
    {
        world.removeRigidBody(bodies[i].body);
    }

    bodies.length=0;
}

function spawn()
{
    if(!world)return;

if(!tmpTrans) tmpTrans = new Ammo.btTransform();


    let transform = null;
    let colShape = new Ammo.btSphereShape(inRadius.get());

    colShape.setMargin(0.05);

    let localInertia = new Ammo.btVector3(0, 0, 0);
    colShape.calculateLocalInertia(inMass.get(), localInertia);

    transform = new Ammo.btTransform();
    transform.setIdentity();

    CABLES.AmmoWorld.copyCglTransform(cgl, transform);

    let motionState = new Ammo.btDefaultMotionState(transform);


    let rbInfo = new Ammo.btRigidBodyConstructionInfo(inMass.get(), motionState, colShape, localInertia);
    let body = new Ammo.btRigidBody(rbInfo);

    body.setFriction(inFriction.get());
    body.setRollingFriction(inRollingFriction.get());
    body.setRestitution(inRestitution.get());

    console.log(bodies.length);


    let speed=inSpeed.get();
    let vx = inDirX.get() * speed;
    let vy = inDirY.get() * speed;
    let vz = inDirZ.get() * speed;

    if (!btVelocity) btVelocity = new Ammo.btVector3(0, 0, 0);

    btVelocity.setValue(vx, vy, vz);
    body.setLinearVelocity(btVelocity);


    world.addRigidBody(body);

    motionState.setWorldTransform(transform);
    body.setWorldTransform(transform);

    bodies.push({"body":body,"ms":motionState});

    shouldspawnOne=false;
}

inExec.onTriggered=()=>
{
    if(shouldspawnOne) spawn();
    world = cgl.frameStore.ammoWorld;

    if(inRemoveFalling.get())
    {
        for(let i=0;i<bodies.length;i++)
            if(bodies[i])
            {
                bodies[i].ms.getWorldTransform(tmpTrans);
                let p = tmpTrans.getOrigin();
                if(p.y()<-100)bodies.splice(i,1);
            }
    }



    next.trigger();
};