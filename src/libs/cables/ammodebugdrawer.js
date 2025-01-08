
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
        this.debugDrawMode = options.debugDrawMode || AmmoDebugConstants.DrawWireframe + AmmoDebugConstants.DrawConstraints;

        this.index = 0;
        // if (this.indexArray)
        // {
        //     Atomics.store(this.indexArray, 0, this.index);
        // }

        this.enabled = true;


        this.debugDrawer = new Ammo.DebugDrawer();
        this.debugDrawer.drawLine = this.drawLine.bind(this);
        this.debugDrawer.drawTriangle = this.drawTriangle.bind(this);
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

        this._lineShader = null;
        this._shaderFrag = ""
            .endl() + "precision highp float;"
            .endl() + "IN vec4 vertCol;"

            .endl() + "void main()"
            .endl() + "{"
            .endl() + "    outColor = vertCol;"
            .endl() + "}";

        this._shaderVert = ""
            .endl() + "IN vec3 vPosition;"
            .endl() + "UNI mat4 projMatrix;"
            .endl() + "UNI mat4 mvMatrix;"
            .endl() + "OUT vec4 vertCol;"
            .endl() + "IN vec4 attrVertColor;"

            .endl() + "void main()"
            .endl() + "{"
            .endl() + "   vec4 pos=vec4(vPosition, 1.0);"
            .endl() + "   vertCol=attrVertColor;"
            .endl() + "   gl_PointSize=20.0;"

            .endl() + "   gl_Position = projMatrix * mvMatrix * pos;"
            .endl() + "}";
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

        if (!this._lineShader)
        {
            this._lineShader = new CGL.Shader(cgl, "ammoDebugLineShader");
            this._lineShader.setSource(this._shaderVert, this._shaderFrag);
        }

        if (!this._lineGeom)
        {
            this._lineGeom = new CGL.Geometry("ammoDebugLines");
            this._lineMesh = new CGL.Mesh(cgl, this._lineGeom, cgl.gl.LINES);
            this._lineMesh.setGeom(this._lineGeom);
            this._lineGeom.vertices = [];

            this._pointGeom = new CGL.Geometry("ammoDebugPoints");
            this._pointMesh = new CGL.Mesh(cgl, this._pointGeom, cgl.gl.LINES);
            this._pointMesh.setGeom(this._pointGeom);
            this._pointGeom.vertices = [];
        }

        this._lineShader.glPrimitive = cgl.gl.LINES;
        this._lineMesh.render(this._lineShader);

        this._lineShader.glPrimitive = cgl.gl.POINTS;
        this._pointMesh.render(this._lineShader);
    }

    update()
    {
        if (!this._lineGeom) return;

        this.index = 0;
        this.verts = [];
        this.vertCols = [];

        this.indexPoints = 0;
        this.vertPoints = [];
        this.vertPointCols = [];

        this.world.debugDrawWorld();

        // console.log("upd", this.index);
        // console.log(this._lineGeom.vertices);
        this._lineGeom.setPointVertices(this.verts);
        this._lineGeom.vertexColors = this.vertCols;
        this._lineMesh.setGeom(this._lineGeom);

        this._pointGeom.setPointVertices(this.vertPoints);
        this._pointGeom.vertexColors = this.vertPointCols;
        this._pointMesh.setGeom(this._pointGeom);


        // this._lineMesh.setAttribute(CGL.SHADERVAR_VERTEX_COLOR || "attrVertColor", this.vertCols, 4);
        // this._lineMesh.setAttribute(CGL.SHADERVAR_VERTEX_POSITION, this.verts, 3);
        // this._lineMesh.setAttribute(CGL.SHADERVAR_VERTEX_COLOR || "attrVertColor", this.vertCols, 4);
    }


    // virtual void   drawContactPoint(const btVector3& PointOnB, const btVector3& normalOnB, btScalar distance, int lifeTime, const btVector3& color);

    drawContactPoint(pointOnB, normalOnB, distance, lifeTime, color)
    {
        const heap = Ammo.HEAPF32;
        const r = heap[(color + 0) / 4];
        const g = heap[(color + 4) / 4];
        const b = heap[(color + 8) / 4];

        const x = heap[(pointOnB + 0) / 4];
        const y = heap[(pointOnB + 4) / 4];
        const z = heap[(pointOnB + 8) / 4];

        let idx = this.indexPoints * 3;
        let idxc = this.indexPoints * 4;

        this.vertPoints[idx + 0] = x;
        this.vertPoints[idx + 1] = y;
        this.vertPoints[idx + 2] = z;

        this.vertPointCols[idxc + 0] = r;
        this.vertPointCols[idxc + 1] = g;
        this.vertPointCols[idxc + 2] = b;
        this.vertPointCols[idxc + 3] = 1;
        this.indexPoints++;
    }

    // virtual void   drawTriangle(const btVector3& a, const btVector3& b, const btVector3& c, const btVector3& color, btScalar alpha);
    drawTriangle(a, b, c, color)
    {
        console.log("draw triangle!");
        this.drawLine(a, b, color);
        this.drawLine(b, c, color);
        this.drawLine(a, c, color);
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
        this.vertCols[idxCol + 3] = 0.6;

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
        this.vertCols[idxCol + 3] = 0.6;

        this.index++;

        // setXYZ(this.verticesArray, this.index, toX, toY, toZ);
        // setXYZ(this.colorsArray, this.index++, r, g, b);

        // console.log("line!", from, to, color);
    }

    // TODO: figure out how to make lifeTime work
    // drawContactPoint(pointOnB, normalOnB, distance, lifeTime, color)
    // {
    //     // const heap = Ammo.HEAPF32;
    //     // const r = heap[(color + 0) / 4];
    //     // const g = heap[(color + 4) / 4];
    //     // const b = heap[(color + 8) / 4];

    //     // const x = heap[(pointOnB + 0) / 4];
    //     // const y = heap[(pointOnB + 4) / 4];
    //     // const z = heap[(pointOnB + 8) / 4];
    //     // setXYZ(this.verticesArray, this.index, x, y, z);
    //     // setXYZ(this.colorsArray, this.index++, r, g, b);

    //     // const dx = heap[(normalOnB + 0) / 4] * distance;
    //     // const dy = heap[(normalOnB + 4) / 4] * distance;
    //     // const dz = heap[(normalOnB + 8) / 4] * distance;
    //     // setXYZ(this.verticesArray, this.index, x + dx, y + dy, z + dz);
    //     // setXYZ(this.colorsArray, this.index++, r, g, b);
    // }

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

CABLES.AmmoDebugDrawer = AmmoDebugDrawer;
