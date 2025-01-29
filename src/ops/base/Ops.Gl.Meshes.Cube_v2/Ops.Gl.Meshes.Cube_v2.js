const
    render = op.inTrigger("Render"),
    active = op.inValueBool("Render Mesh", true),
    width = op.inValue("Width", 1),
    len = op.inValue("Length", 1),
    height = op.inValue("Height", 1),
    center = op.inValueBool("Center", true),
    mapping = op.inSwitch("Mapping", ["Side", "Cube +-", "SideWrap"], "Side"),
    mappingBias = op.inValue("Bias", 0),
    inFlipX = op.inValueBool("Flip X", true),
    sideTop = op.inValueBool("Top", true),
    sideBottom = op.inValueBool("Bottom", true),
    sideLeft = op.inValueBool("Left", true),
    sideRight = op.inValueBool("Right", true),
    sideFront = op.inValueBool("Front", true),
    sideBack = op.inValueBool("Back", true),
    trigger = op.outTrigger("Next"),
    geomOut = op.outObject("geometry", null, "geometry");

const cgl = op.patch.cgl;
op.toWorkPortsNeedToBeLinked(render);
op.toWorkShouldNotBeChild("Ops.Gl.TextureEffects.ImageCompose", CABLES.OP_PORT_TYPE_FUNCTION);

op.setPortGroup("Mapping", [mapping, mappingBias, inFlipX]);
op.setPortGroup("Geometry", [width, height, len, center]);
op.setPortGroup("Sides", [sideTop, sideBottom, sideLeft, sideRight, sideFront, sideBack]);

let geom = null,
    mesh = null,
    meshvalid = true,
    needsRebuild = true;

mappingBias.onChange =
    inFlipX.onChange =
    sideTop.onChange =
    sideBottom.onChange =
    sideLeft.onChange =
    sideRight.onChange =
    sideFront.onChange =
    sideBack.onChange =
    mapping.onChange =
    width.onChange =
    height.onChange =
    len.onChange =
    center.onChange = buildMeshLater;

function buildMeshLater()
{
    needsRebuild = true;
}

render.onLinkChanged = function ()
{
    if (!render.isLinked()) geomOut.set(null);
    else geomOut.setRef(geom);
};

render.onTriggered = function ()
{
    if (needsRebuild)buildMesh();
    if (active.get() && mesh && meshvalid) mesh.render();
    trigger.trigger();
};

op.preRender = function ()
{
    buildMesh();
    if (mesh && cgl)mesh.render();
};

function buildMesh()
{
    if (!geom)geom = new CGL.Geometry("cubemesh");
    geom.clear();

    let x = width.get();
    let nx = -1 * width.get();
    let y = height.get();
    let ny = -1 * height.get();
    let z = len.get();
    let nz = -1 * len.get();

    if (!center.get())
    {
        nx = 0;
        ny = 0;
        nz = 0;
    }
    else
    {
        x *= 0.5;
        nx *= 0.5;
        y *= 0.5;
        ny *= 0.5;
        z *= 0.5;
        nz *= 0.5;
    }

    addAttribs(geom, x, y, z, nx, ny, nz);
    if (mapping.get() == "Side") sideMappedCube(geom, 1, 1, 1);
    else if (mapping.get() == "SideWrap") sideMappedCube(geom, x, y, z);
    else cubeMappedCube(geom);

    geom.verticesIndices = [];
    if (sideTop.get()) geom.verticesIndices.push(8, 9, 10, 8, 10, 11); // Top face
    if (sideBottom.get()) geom.verticesIndices.push(12, 13, 14, 12, 14, 15); // Bottom face
    if (sideLeft.get()) geom.verticesIndices.push(20, 21, 22, 20, 22, 23); // Left face
    if (sideRight.get()) geom.verticesIndices.push(16, 17, 18, 16, 18, 19); // Right face
    if (sideBack.get()) geom.verticesIndices.push(4, 5, 6, 4, 6, 7); // Back face
    if (sideFront.get()) geom.verticesIndices.push(0, 1, 2, 0, 2, 3); // Front face

    if (geom.verticesIndices.length === 0) meshvalid = false;
    else meshvalid = true;

    if (mesh)mesh.dispose();
    if (op.patch.cg) mesh = op.patch.cg.createMesh(geom, { "opId": op.id });

    geomOut.setRef(geom);

    needsRebuild = false;
}

op.onDelete = function ()
{
    if (mesh)mesh.dispose();
};

function sideMappedCube(geom, x, y, z)
{
    const bias = mappingBias.get();

    let u1 = 1.0 - bias;
    let u0 = 0.0 + bias;
    if (inFlipX.get())
    {
        [u1, u0] = [u0, u1];
    }

    let v1 = 1.0 - bias;
    let v0 = 0.0 + bias;

    geom.setTexCoords([
        // Front face
        x * u0, y * v1,
        x * u1, y * v1,
        x * u1, y * v0,
        x * u0, y * v0,
        // Back face
        x * u1, y * v1,
        x * u1, y * v0,
        x * u0, y * v0,
        x * u0, y * v1,
        // Top face
        x * u0, z * v0,
        x * u0, z * v1,
        x * u1, z * v1,
        x * u1, z * v0,
        // Bottom face
        x * u1, y * v0,
        x * u0, y * v0,
        x * u0, y * v1,
        x * u1, y * v1,
        // Right face
        z * u1, y * v1,
        z * u1, y * v0,
        z * u0, y * v0,
        z * u0, y * v1,
        // Left face
        z * u0, y * v1,
        z * u1, y * v1,
        z * u1, y * v0,
        z * u0, y * v0,
    ]);
}

function cubeMappedCube(geom, x, y, z, nx, ny, nz)
{
    const sx = 0.25;
    const sy = 1 / 3;
    const bias = mappingBias.get();

    let flipx = 0.0;
    if (inFlipX.get()) flipx = 1.0;

    const tc = [];
    tc.push(
        // Front face   Z+
        flipx + sx + bias, sy * 2 - bias, flipx + sx * 2 - bias, sy * 2 - bias, flipx + sx * 2 - bias, sy + bias, flipx + sx + bias, sy + bias,
        // Back face Z-
        flipx + sx * 4 - bias, sy * 2 - bias, flipx + sx * 4 - bias, sy + bias, flipx + sx * 3 + bias, sy + bias, flipx + sx * 3 + bias, sy * 2 - bias);

    if (inFlipX.get())
        tc.push(
            // Top face
            sx + bias, 0 - bias, sx * 2 - bias, 0 - bias, sx * 2 - bias, sy * 1 + bias, sx + bias, sy * 1 + bias,
            // Bottom face
            sx + bias, sy * 3 + bias, sx + bias, sy * 2 - bias, sx * 2 - bias, sy * 2 - bias, sx * 2 - bias, sy * 3 + bias
        );

    else
        tc.push(
            // Top face
            sx + bias, 0 + bias, sx + bias, sy * 1 - bias, sx * 2 - bias, sy * 1 - bias, sx * 2 - bias, 0 + bias,
            // Bottom face
            sx + bias, sy * 3 - bias, sx * 2 - bias, sy * 3 - bias, sx * 2 - bias, sy * 2 + bias, sx + bias, sy * 2 + bias);

    tc.push(
        // Right face
        flipx + sx * 3 - bias, 1.0 - sy - bias, flipx + sx * 3 - bias, 1.0 - sy * 2 + bias, flipx + sx * 2 + bias, 1.0 - sy * 2 + bias, flipx + sx * 2 + bias, 1.0 - sy - bias,
        // Left face
        flipx + sx * 0 + bias, 1.0 - sy - bias, flipx + sx * 1 - bias, 1.0 - sy - bias, flipx + sx * 1 - bias, 1.0 - sy * 2 + bias, flipx + sx * 0 + bias, 1.0 - sy * 2 + bias);

    geom.setTexCoords(tc);
}

function addAttribs(geom, x, y, z, nx, ny, nz)
{
    geom.vertices = [
        // Front face
        nx, ny, z,
        x, ny, z,
        x, y, z,
        nx, y, z,
        // Back face
        nx, ny, nz,
        nx, y, nz,
        x, y, nz,
        x, ny, nz,
        // Top face
        nx, y, nz,
        nx, y, z,
        x, y, z,
        x, y, nz,
        // Bottom face
        nx, ny, nz,
        x, ny, nz,
        x, ny, z,
        nx, ny, z,
        // Right face
        x, ny, nz,
        x, y, nz,
        x, y, z,
        x, ny, z,
        // zeft face
        nx, ny, nz,
        nx, ny, z,
        nx, y, z,
        nx, y, nz
    ];

    geom.vertexNormals = new Float32Array([
        // Front face
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,

        // Back face
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,

        // Top face
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,

        // Bottom face
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,

        // Right face
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,

        // Left face
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0
    ]);
    geom.tangents = new Float32Array([
        // front face
        0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
        // back face
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
        // top face
        -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
        // bottom face
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
        // right face
        0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
        // left face
        0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1
    ]);
    geom.biTangents = new Float32Array([
        // front face
        -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
        // back face
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
        // top face
        0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
        // bottom face
        0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
        // right face
        0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
        // left face
        0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1
    ]);
}
