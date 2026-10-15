const
    exec = op.inTrigger("Trigger"),
    inName = op.inString("Name", "terrain"),
    inRender = op.inBool("Render", true),

    inArray = op.inArray("Heights"),
    inResX = op.inInt("Resolution X", 64),
    inResZ = op.inInt("Resolution Z", 64),

    inSizeX = op.inFloat("Size X", 100),
    inSizeZ = op.inFloat("Size Z", 100),
    inHeight = op.inFloat("Height", 1),

    inFriction = op.inFloat("Friction", 1),
    inGroup = op.inInt("Collision Group", 1),
    inCollidesWith = op.inString("Collides With", ""),

    next = op.outTrigger("Next"),
    outMin = op.outNumber("Min Height"),
    outMax = op.outNumber("Max Height"),
    outGeom = op.outObject("Geometry", null, "geometry"),
    outCollider = op.outArray("Collider");

op.setPortGroup("Heightmap", [inArray, inResX, inResZ]);
op.setPortGroup("Size", [inSizeX, inSizeZ, inHeight]);
op.setPortGroup("Properties", [inFriction]);
op.setPortGroup("Collision Groups", [inGroup, inCollidesWith]);

const cgl = op.patch.cgl;
const MIN_RESOLUTION = 2;
const MAX_RESOLUTION = 1024;

const DEFAULT_COLLISION_GROUPS = 0xffffffff;
let collisionGroups = DEFAULT_COLLISION_GROUPS;
let groupsChanged = true;

let world = null;
let body = null;
let collider = null;
let mesh = null;
let needsGeom = true;
let needsBody = true;
let heights = [];
let resX = 0;
let resZ = 0;

inSizeX.onChange =
    inSizeZ.onChange =
    inHeight.onChange =
    inResX.onChange =
    inResZ.onChange =
    inArray.onChange = () => { needsGeom = true; };

inFriction.onChange = () =>
{
    if (collider) collider.setFriction(inFriction.get());
};

inGroup.onChange =
    inCollidesWith.onChange = () =>
    {
        groupsChanged = true;
    };

inName.onChange = () => { op.setUiAttrib({ "extendTitle": inName.get() }); };

op.onDelete = () =>
{
    removeBody();
    if (mesh) mesh.dispose();
    mesh = null;
};

exec.onTriggered = () =>
{
    if (needsGeom) buildHeights();

    const currentWorld = op.patch.frameStore.rapier?.world;
    if (currentWorld != world)
    {
        body = null;
        collider = null;
        world = currentWorld;
        needsBody = true;
    }
    if (world && groupsChanged) updateCollisionGroups(op.patch.frameStore.rapier.tools);
    if (world && needsBody) createBody();

    if (inRender.get() && mesh)
    {
        cgl.pushModelMatrix();
        mat4.identity(cgl.mMatrix);
        mesh.render(cgl.getShader());
        cgl.popModelMatrix();
    }

    next.trigger();
};

function clampResolution(v)
{
    return Math.max(MIN_RESOLUTION, Math.min(MAX_RESOLUTION, Math.round(v)));
}

function buildHeights()
{
    needsGeom = false;
    needsBody = true;
    resX = clampResolution(inResX.get());
    resZ = clampResolution(inResZ.get());
    heights = new Array(resX * resZ);
    if (!readHeights()) heights.fill(0);

    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < heights.length; i++)
    {
        if (heights[i] < min) min = heights[i];
        if (heights[i] > max) max = heights[i];
    }

    outMin.set(min);
    outMax.set(max);
    buildGeometry();
}

function readHeights()
{
    const arr = inArray.get();
    if (!arr || arr.length != resX * resZ)
    {
        op.setUiError("arraysize", "Heights needs Resolution X * Resolution Z values (" + resX * resZ + "), got " + (arr ? arr.length : 0), 1);
        return false;
    }
    op.setUiError("arraysize", null);

    for (let i = 0; i < heights.length; i++) heights[i] = arr[i] * inHeight.get();
    return true;
}

function heightAt(ix, iz)
{
    ix = Math.max(0, Math.min(resX - 1, ix));
    iz = Math.max(0, Math.min(resZ - 1, iz));
    return heights[iz * resX + ix];
}

function buildGeometry()
{
    const sizeX = inSizeX.get();
    const sizeZ = inSizeZ.get();
    const cellX = sizeX / (resX - 1);
    const cellZ = sizeZ / (resZ - 1);
    const verts = [];
    const normals = [];
    const texCoords = [];
    const indices = [];
    const normal = vec3.create();

    for (let iz = 0; iz < resZ; iz++)
    {
        for (let ix = 0; ix < resX; ix++)
        {
            verts.push(ix * cellX - sizeX / 2, heightAt(ix, iz), iz * cellZ - sizeZ / 2);
            texCoords.push(ix / (resX - 1), iz / (resZ - 1));

            vec3.set(normal,
                (heightAt(ix - 1, iz) - heightAt(ix + 1, iz)) / (2 * cellX),
                1,
                (heightAt(ix, iz - 1) - heightAt(ix, iz + 1)) / (2 * cellZ));
            vec3.normalize(normal, normal);
            normals.push(normal[0], normal[1], normal[2]);
        }
    }

    for (let iz = 0; iz < resZ - 1; iz++)
    {
        for (let ix = 0; ix < resX - 1; ix++)
        {
            const a = iz * resX + ix;
            const b = a + 1;
            const c = a + resX;
            const d = c + 1;
            indices.push(a, c, b, b, c, d);
        }
    }

    const geom = new CGL.Geometry(inName.get());
    geom.vertices = verts;
    geom.vertexNormals = normals;
    geom.texCoords = texCoords;
    geom.verticesIndices = indices;
    geom.calcTangentsBitangents();

    if (mesh) mesh.setGeom(geom);
    else mesh = new CGL.Mesh(cgl, geom);
    outGeom.setRef(geom);
}

function createBody()
{
    removeBody();
    needsBody = false;
    if (resX < MIN_RESOLUTION || resZ < MIN_RESOLUTION) return;

    const columnMajor = new Float32Array(resX * resZ);
    for (let iz = 0; iz < resZ; iz++)
        for (let ix = 0; ix < resX; ix++)
            columnMajor[iz + ix * resZ] = heights[iz * resX + ix];

    body = world.createRigidBody(RAPIER.RigidBodyDesc.fixed());
    body.userData = { "name": inName.get() };

    const scale = { "x": inSizeX.get(), "y": 1, "z": inSizeZ.get() };
    const desc = RAPIER.ColliderDesc.heightfield(resZ - 1, resX - 1, columnMajor, scale)
        .setFriction(inFriction.get())
        .setCollisionGroups(collisionGroups);
    collider = world.createCollider(desc, body);
    outCollider.setRef([collider]);
}

function removeBody()
{
    if (world && body) world.removeRigidBody(body);
    body = null;
    collider = null;
    outCollider.setRef([]);
}

function updateCollisionGroups(tools)
{
    if (!tools) return;

    collisionGroups = tools.getCollisionGroups(inGroup.get(), inCollidesWith.get());
    groupsChanged = false;

    if (tools.collidesWithNothing(collisionGroups)) op.setUiError("groupfilter", "Collides With has no valid group (1-" + tools.GROUP_COUNT + "), terrain collides with nothing", 1);
    else op.setUiError("groupfilter", null);

    if (collider) collider.setCollisionGroups(collisionGroups);
}
