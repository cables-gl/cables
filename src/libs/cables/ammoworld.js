// https://stackoverflow.com/questions/12251199/re-positioning-a-rigid-body-in-bullet-physics


CABLES.AmmoWorld = class
{
    constructor()
    {
        this.world = null;
        this.bodies = [];
        this._countIndex = 1;
        this._bodymeta = {};

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
        this.collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
        this.dispatcher = new Ammo.btCollisionDispatcher(this.collisionConfiguration);
        this.overlappingPairCache = new Ammo.btDbvtBroadphase();
        this.solver = new Ammo.btSequentialImpulseConstraintSolver();

        this.world = new Ammo.btDiscreteDynamicsWorld(this.dispatcher, this.overlappingPairCache, this.solver, this.collisionConfiguration);

        this.world.setGravity(new Ammo.btVector3(0, -10, 0));

        console.log("world setup done");
        console.log(this.world);
    }

    dispose()
    {
        if (!this.world) return;

        for (let i = 0; i < this.bodies.length; i++)
        {
            if (this.bodies[i])
            {
                this.world.removeRigidBody(this.bodies[i]);
                Ammo.destroy(this.bodies[i]);
            }
        }
        this.bodies = [];

        Ammo.destroy(this.world);
        this.world = null;
        Ammo.destroy(this.collisionConfiguration);
        Ammo.destroy(this.dispatcher);
        Ammo.destroy(this.overlappingPairCache);
        Ammo.destroy(this.solver);
    }

    removeRigidBody(b)
    {
        if (this.world && b)
        {
            this.world.removeRigidBody(b);
        }
        const idx = this.bodies.indexOf(b);
        if (idx > -1) this.bodies.splice(idx, 1);
    }

    createRigidBody()
    {

    }

    addRigidBody(body)
    {
        body.setUserIndex(++this._countIndex);
        this.world.addRigidBody(body);
        this.bodies.push(body);

        console.log(body);
    }

    setBodyMeta(body, meta)
    {
        if (body.getUserIndex() == 0)body.setUserIndex(++this._countIndex);
        this._bodymeta[body.getUserIndex()] = meta;
    }

    getBodyMeta(body)
    {
        return this._bodymeta[body.getUserIndex()];
    }

    numBodies()
    {
        return this.bodies.length;
    }

    renderDebug()
    {
        // for (let i = 0; i < this.bodies.length; i++)
        // {
        //     const tmpTrans = new Ammo.btTransform();
        //     const ms = this.bodies[i].getMotionState();
        //     ms.getWorldTransform(tmpTrans);

        //     const orig = tmpTrans.getOrigin();
        //     console.log(orig.x(), orig.y(), orig.z());
        // }
    }

    frame()
    {
        if (!this.world) return;
        let deltaTime = 16; // TODO
        this.world.stepSimulation(deltaTime, 10);
    }
};
