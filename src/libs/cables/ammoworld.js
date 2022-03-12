
CABLES.AmmoWorld = class
{
    constructor()
    {
        this.world = null;
        this.bodies = [];

        try
        {
            Ammo().then(() => { this.setupWorld().bind(this); });
        }
        catch (e)
        {
            console.log("ammo already exists ...");
            if (Ammo) this.setupWorld();
            else console.log(e);
        }
    }

    setupWorld()
    {
        console.log(Ammo);
        let collisionConfiguration = new Ammo.btDefaultCollisionConfiguration(),
            dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration),
            overlappingPairCache = new Ammo.btDbvtBroadphase(),
            solver = new Ammo.btSequentialImpulseConstraintSolver();

        this.world = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);

        this.world.setGravity(new Ammo.btVector3(0, -10, 0));

        console.log("world setup done");
    }

    removeRigidBody(b)
    {
        this.world.removeRigidBody(b);

        const idx = this.bodies.indexOf(b);
        this.bodies.splice(idx, 1);
    }

    addRigidBody(b)
    {
        this.world.addRigidBody(b);
        this.bodies.push(b);

        console.log(b);
    }

    numBodies()
    {
        return this.bodies.length;
    }

    renderDebug()
    {
        for (let i = 0; i < this.bodies.length; i++)
        {
            const tmpTrans = new Ammo.btTransform();
            const ms = this.bodies[i].getMotionState();
            ms.getWorldTransform(tmpTrans);

            const orig = tmpTrans.getOrigin();
            console.log(orig.x(), orig.y(), orig.z());
        }
    }

    frame()
    {
        if (!this.world) return;
        let deltaTime = 16; // TODO
        this.world.stepSimulation(deltaTime, 10);
    }
};
