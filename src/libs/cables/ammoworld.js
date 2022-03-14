// https://stackoverflow.com/questions/12251199/re-positioning-a-rigid-body-in-bullet-physics

// https://github.com/InfiniteLee/ammo-debug-drawer

CABLES.AmmoWorld = class
{
    constructor()
    {
        this.world = null;
        this.debugDrawer = null;
        this.bodies = [];
        this._countIndex = 1;
        this._bodymeta = {};

        try
        {
            Ammo().then(() => { this.setupWorld(); });
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

        this.debugDrawer = new AmmoDebugDrawer(this.world, { });
        this.debugDrawer.enable();
        // this.debugDrawer.setDebugMode(1);

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


    frame()
    {
        if (!this.world) return;
        let deltaTime = 16; // TODO
        this.world.stepSimulation(deltaTime, 10);
    }

    renderDebug(cgl)
    {
        if (!this.debugDrawer) return;
        this.debugDrawer.update();
        this.debugDrawer.render(cgl);
    }
};

// //////////////////////////////////////////////////////////////////////////////////////////////////////////////

const AmmoDebugConstants = {
    "NoDebug": 0,
    "DrawWireframe": 1,
    "DrawAabb": 2,
    "DrawFeaturesText": 4,
    "DrawContactPoints": 8,
    "NoDeactivation": 16,
    "NoHelpText": 32,
    "DrawText": 64,
    "ProfileTimings": 128,
    "EnableSatComparison": 256,
    "DisableBulletLCP": 512,
    "EnableCCD": 1024,
    "DrawConstraints": 1 << 11, // 2048
    "DrawConstraintLimits": 1 << 12, // 4096
    "FastWireframe": 1 << 13, // 8192
    "DrawNormals": 1 << 14, // 16384
    "MAX_DEBUG_DRAW_MODE": 0xffffffff
};


class AmmoDebugDrawer
{
    constructor(world, options)
    {
        this.world = world;
        options = options || {};

        this.verts = [];
        this._lineGeom = null;
        this._lineMesh = null;
        this.debugDrawMode = options.debugDrawMode || AmmoDebugConstants.DrawWireframe;

        this.index = 0;
        // if (this.indexArray)
        // {
        //     Atomics.store(this.indexArray, 0, this.index);
        // }

        this.enabled = true;


        this.debugDrawer = new Ammo.DebugDrawer();
        this.debugDrawer.drawLine = this.drawLine.bind(this);
        this.debugDrawer.drawContactPoint = this.drawContactPoint.bind(this);
        this.debugDrawer.reportErrorWarning = this.reportErrorWarning.bind(this);
        this.debugDrawer.draw3dText = this.draw3dText.bind(this);
        this.debugDrawer.setDebugMode = this.setDebugMode.bind(this);
        this.debugDrawer.getDebugMode = this.getDebugMode.bind(this);
        this.debugDrawer.enable = this.enable.bind(this);
        this.debugDrawer.disable = this.disable.bind(this);
        this.debugDrawer.update = this.update.bind(this);
        this.debugDrawer.enabled = true;
        this.world.setDebugDrawer(this.debugDrawer);

        console.log("this.getDebugMode", this.getDebugMode(), this.enabled);
    }


    enable()
    {
        this.enabled = true;
    }

    disable()
    {
        this.enabled = false;
    }

    render(cgl)
    {
        if (!this.enabled)
        {
            return;
        }


        if (!this._lineGeom)
        {
            this._lineGeom = new CGL.Geometry("marker");
            // this._lineGeom.setPointVertices(
            //     [
            //         0.00001, 0, 0, 1, 0, 0,
            //         0, 0.00001, 0, 0, 1, 0,
            //         0, 0, 0.00001, 0, 0, 1,
            //     ]
            // );
            this._lineMesh = new CGL.Mesh(cgl, this._lineGeom, cgl.gl.LINES);
            // this._lineGeom.glPrimitive = cgl.gl.LINES;
            this._lineMesh.setGeom(this._lineGeom);
            this._lineGeom.vertices = [];
            console.log("new debug mesh...");
        }


        // if (this.indexArray)
        // {
        //     if (Atomics.load(this.indexArray, 0) === 0)
        //     {
        //         this.index = 0;
        //         this.world.debugDrawWorld();
        //         Atomics.store(this.indexArray, 0, this.index);
        //     }
        // }
        // else
        // {

        // console.log(1);

        this._lineMesh.render(cgl.getShader());
        // }
    }

    update()
    {
        if (!this._lineGeom) return;
        this.verts = [];
        this.vertCols = [];
        this.index = 0;
        this.world.debugDrawWorld();

        // console.log("upd", this.index);
        // console.log(this._lineGeom.vertices);
        this._lineGeom.setPointVertices(this.verts);
        this._lineGeom.vertexColors = this.vertCols;

        this._lineMesh.setGeom(this._lineGeom);


        // this._lineMesh.setAttribute(CGL.SHADERVAR_VERTEX_COLOR || "attrVertColor", this.vertCols, 4);
        // this._lineMesh.setAttribute(CGL.SHADERVAR_VERTEX_POSITION, this.verts, 3);
        // this._lineMesh.setAttribute(CGL.SHADERVAR_VERTEX_COLOR || "attrVertColor", this.vertCols, 4);
    }

    drawLine(from, to, color)
    {
        let idx = this.index * 3;
        let idxCol = this.index * 4;

        const heap = Ammo.HEAPF32;
        const r = heap[(color + 0) / 4];
        const g = heap[(color + 4) / 4];
        const b = heap[(color + 8) / 4];

        this.vertCols[idxCol + 0] = r;
        this.vertCols[idxCol + 1] = g;
        this.vertCols[idxCol + 2] = b;
        this.vertCols[idxCol + 3] = 1;


        const fromX = heap[(from + 0) / 4];
        const fromY = heap[(from + 4) / 4];
        const fromZ = heap[(from + 8) / 4];

        this.verts[idx + 0] = fromX;
        this.verts[idx + 1] = fromY;
        this.verts[idx + 2] = fromZ;
        // setXYZ(this.verticesArray, this.index, fromX, fromY, fromZ);
        // setXYZ(this.colorsArray, this.index++, r, g, b);

        const toX = heap[(to + 0) / 4];
        const toY = heap[(to + 4) / 4];
        const toZ = heap[(to + 8) / 4];

        this.index++;
        idx = this.index * 3;
        idxCol = this.index * 4;
        this.verts[idx + 0] = toX;
        this.verts[idx + 1] = toY;
        this.verts[idx + 2] = toZ;


        this.vertCols[idxCol + 0] = r;
        this.vertCols[idxCol + 1] = g;
        this.vertCols[idxCol + 2] = b;
        this.vertCols[idxCol + 3] = 1;


        this.index++;

        // setXYZ(this.verticesArray, this.index, toX, toY, toZ);
        // setXYZ(this.colorsArray, this.index++, r, g, b);

        // console.log("line!", from, to, color);
    }

    // TODO: figure out how to make lifeTime work
    drawContactPoint(pointOnB, normalOnB, distance, lifeTime, color)
    {
        // const heap = Ammo.HEAPF32;
        // const r = heap[(color + 0) / 4];
        // const g = heap[(color + 4) / 4];
        // const b = heap[(color + 8) / 4];

        // const x = heap[(pointOnB + 0) / 4];
        // const y = heap[(pointOnB + 4) / 4];
        // const z = heap[(pointOnB + 8) / 4];
        // setXYZ(this.verticesArray, this.index, x, y, z);
        // setXYZ(this.colorsArray, this.index++, r, g, b);

        // const dx = heap[(normalOnB + 0) / 4] * distance;
        // const dy = heap[(normalOnB + 4) / 4] * distance;
        // const dz = heap[(normalOnB + 8) / 4] * distance;
        // setXYZ(this.verticesArray, this.index, x + dx, y + dy, z + dz);
        // setXYZ(this.colorsArray, this.index++, r, g, b);
    }

    reportErrorWarning(warningString)
    {
        if (Ammo.hasOwnProperty("UTF8ToString"))
        {
            console.warn(Ammo.UTF8ToString(warningString));
        }
        else if (!this.warnedOnce)
        {
            this.warnedOnce = true;
            console.warn("Cannot print warningString, please export UTF8ToString from Ammo.js in make.py");
        }
    }

    draw3dText(location, textString)
    {
    // TODO
        console.warn("TODO: draw3dText");
    }

    setDebugMode(debugMode)
    {
        this.debugDrawMode = debugMode;
    }

    getDebugMode()
    {
        return this.debugDrawMode;
    }
}
