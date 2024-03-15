// https://stackoverflow.com/questions/12251199/re-positioning-a-rigid-body-in-bullet-physics
// https://github.com/InfiniteLee/ammo-debug-drawer
import { Events } from "cables-shared-client";

const AmmoWorld = class extends Events
{
    constructor()
    {
        super();
        this.world = null;
        this.bodies = [];
        this._countIndex = 1;
        this._bodymeta = {};
        this.lastTime = performance.now();
        this._collisions = [];
        this.autoRemove = true;

        this.setupWorld();
    }

    setupWorld()
    {
        this.collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
        this.dispatcher = new Ammo.btCollisionDispatcher(this.collisionConfiguration);
        this.overlappingPairCache = new Ammo.btDbvtBroadphase();
        this.solver = new Ammo.btSequentialImpulseConstraintSolver();

        this.world = new Ammo.btDiscreteDynamicsWorld(this.dispatcher, this.overlappingPairCache, this.solver, this.collisionConfiguration);

        this.world.setGravity(new Ammo.btVector3(0, -9, 0));
    }

    getListBodies()
    {
        const arr = [];
        for (let i in this._bodymeta)
        {
            arr.push(this._bodymeta[i]);
        }
        return arr;
    }

    dispose()
    {
        if (!this.world) return;

        this.emitEvent("dispose");

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
        const idx = this.bodies.indexOf(b);
        const metaIdx = b.getUserIndex();
        if (this.world && b)
            this.world.removeRigidBody(b);

        if (idx > -1) this.bodies.splice(idx, 1);

        delete this._bodymeta[metaIdx];
    }

    createRigidBody()
    {

    }

    addRigidBody(body)
    {
        if (!this.world) return;
        body.setUserIndex(++this._countIndex);
        this.world.addRigidBody(body);
        this.bodies.push(body);
    }

    setBodyMeta(body, meta)
    {
        if (body.getUserIndex() == 0)body.setUserIndex(++this._countIndex);
        meta.body = body;
        this._bodymeta[body.getUserIndex()] = meta;
    }

    getBodyMeta(body)
    {
        if (body) return this._bodymeta[body.getUserIndex()];
    }

    pingBody(body)
    {
        const m = this._bodymeta[body.getUserIndex()];
        if (m) m.ping = Math.round(performance.now());
    }

    getBodyByName(n)
    {
        for (let i in this._bodymeta)
        {
            if (this._bodymeta[i].name == n)
            {
                // console.log("found name", i);
                return this._bodymeta[i].body;
            }
        }
    }

    numBodies()
    {
        return this.bodies.length;
    }

    _pingTimeout()
    {
        for (let i in this._bodymeta)
        {
            const b = this._bodymeta[i];
            if (b.ping && performance.now() - b.ping > 50)
            {
                b.removed = true;
                this.removeRigidBody(b.body);
                // console.log("ping timeout", b);
            }
        }
    }

    frame()
    {
        if (!this.world) return;
        let deltaTime = performance.now() - this.lastTime;

        this.world.stepSimulation(deltaTime, 5);

        if (this.autoRemove) this._pingTimeout();
        this._checkCollisions();

        this.lastTime = performance.now();
    }

    activateAllBodies()
    {
        for (let i = 0; i < this.bodies.length; i++)
        {
            this.bodies[i].activate();
        }
    }

    getCollisions()
    {
        return this._collisions;
    }

    _checkCollisions()
    {
        let numManifolds = this.dispatcher.getNumManifolds();

        this._collisions.length = 0;
        for (let i = 0; i < numManifolds; i++)
        {
            let contactManifold = this.dispatcher.getManifoldByIndexInternal(i);
            let numContacts = contactManifold.getNumContacts();

            for (let j = 0; j < numContacts; j++)
            {
                let meta0 = this.getBodyMeta(contactManifold.getBody0());
                let meta1 = this.getBodyMeta(contactManifold.getBody1());

                if (meta0 && meta1)
                {
                    this._collisions.push({
                        "name0": meta0.name,
                        "name1": meta1.name
                    });
                }
            }
        }
    }
};

AmmoWorld._getGeomTriangle = function (geom, i)
{
    const arr = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    if (geom.verticesIndices && geom.verticesIndices.length)
    {
        const i3 = i * 3;
        const i13 = (i + 1) * 3;
        const i23 = (i + 2) * 3;
        arr[0] = geom.vertices[geom.verticesIndices[i3] * 3 + 0];
        arr[1] = geom.vertices[geom.verticesIndices[i3] * 3 + 1];
        arr[2] = geom.vertices[geom.verticesIndices[i3] * 3 + 2];

        arr[3] = geom.vertices[geom.verticesIndices[i13] * 3 + 0];
        arr[4] = geom.vertices[geom.verticesIndices[i13] * 3 + 1];
        arr[5] = geom.vertices[geom.verticesIndices[i13] * 3 + 2];

        arr[6] = geom.vertices[geom.verticesIndices[i23] * 3 + 0];
        arr[7] = geom.vertices[geom.verticesIndices[i23] * 3 + 1];
        arr[8] = geom.vertices[geom.verticesIndices[i23] * 3 + 2];
    }
    else
    {
        arr[0] = geom.vertices[i * 9 + 0];
        arr[1] = geom.vertices[i * 9 + 1];
        arr[2] = geom.vertices[i * 9 + 2];

        arr[3] = geom.vertices[i * 9 + 3];
        arr[4] = geom.vertices[i * 9 + 4];
        arr[5] = geom.vertices[i * 9 + 5];

        arr[6] = geom.vertices[i * 9 + 6];
        arr[7] = geom.vertices[i * 9 + 7];
        arr[8] = geom.vertices[i * 9 + 8];
    }

    return arr;
};

AmmoWorld.createConvexHullFromGeom = function (geom, numTris, scale)
{
    scale = scale || [1, 1, 1];
    const colShape = new Ammo.btConvexHullShape();
    const _vec3_1 = new Ammo.btVector3(0, 0, 0);
    const _vec3_2 = new Ammo.btVector3(0, 0, 0);
    const _vec3_3 = new Ammo.btVector3(0, 0, 0);

    let step = 1;

    if (geom.vertices.length / 3 > numTris && numTris > 0)
    {
        step = Math.floor(geom.vertices.length / 3 / numTris);
    }

    for (let i = 0; i < geom.vertices.length / 3; i += step)
    {
        _vec3_1.setX(geom.vertices[i * 3 + 0] * scale[0]);
        _vec3_1.setY(geom.vertices[i * 3 + 1] * scale[1]);
        _vec3_1.setZ(geom.vertices[i * 3 + 2] * scale[2]);
        colShape.addPoint(_vec3_1, true); // todo: only set true on last vertex
    }

    colShape.initializePolyhedralFeatures();

    // Ammo.destroy(_vec3_1);
    // Ammo.destroy(_vec3_2);
    // Ammo.destroy(_vec3_3);

    return colShape;
};


AmmoWorld.copyCglTransform = function (cgl, transform)
{
    const btOrigin = new Ammo.btVector3(0, 0, 0);
    const btQuat = new Ammo.btQuaternion(0, 0, 0, 1);

    const tmpOrigin = vec3.create();
    const tmpQuat = quat.create();

    mat4.getTranslation(tmpOrigin, cgl.mMatrix);
    mat4.getRotation(tmpQuat, cgl.mMatrix);

    btOrigin.setValue(tmpOrigin[0], tmpOrigin[1], tmpOrigin[2]);
    btQuat.setValue(tmpQuat[0], tmpQuat[1], tmpQuat[2], tmpQuat[3]);

    transform.setOrigin(btOrigin);
    transform.setRotation(btQuat);

    Ammo.destroy(btOrigin);
    Ammo.destroy(btQuat);
};

CABLES.AmmoWorld = AmmoWorld;
