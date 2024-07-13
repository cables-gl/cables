const
    exec = op.inTrigger("Render"),
    inVerts = op.inArray("Vertices"),
    inFaces = op.inArray("Faces"),
    inTexCoords = op.inArray("Texture Coords"),
    inNormals = op.inArray("Normals"),
    next = op.outTrigger("Next"),
    outGeom = op.outObject("Geometry");

let updateVerts = false;
let updateFaces = false;
let updateNormals = false;
let updateTexCoords = false;
let geom = new CGL.Geometry();

inVerts.onChange = () =>
{
    if (inVerts.get())updateVerts = true;
};

inTexCoords.onChange = () =>
{
    if (inTexCoords.get())updateTexCoords = true;
};

inNormals.onChange = () =>
{
    if (inNormals.get())updateNormals = true;
};

inFaces.onChange = () =>
{
    if (inFaces.get())updateFaces = true;
};

inFaces.onLinkChanged =
    inNormals.onLinkChanged =
    inTexCoords.onLinkChanged =
    inVerts.onLinkChanged =
    inFaces.onLinkChanged = () =>
    {
        updateVerts = true;
        updateTexCoords = true;
    };

exec.onTriggered = function ()
{
    const verts = inVerts.get();
    const faces = inFaces.get();
    const normals = inNormals.get();
    const texCoords = inTexCoords.get();
    let changed = false;

    if (updateVerts)
    {
        changed = true;
        updateVerts = false;
        if (verts && verts.length > 0) geom.vertices = verts;
        else geom.vertices = [];
    }

    if (updateFaces)
    {
        changed = true;
        updateFaces = false;
        if (faces && faces.length > 0) geom.verticesIndices = faces;
        else geom.verticesIndices = [];
    }

    if (updateTexCoords)
    {
        changed = true;
        updateTexCoords = false;
        if (texCoords && texCoords.length > 0) geom.texCoords = texCoords;
        else geom.texCoords = [];
    }

    if (updateNormals)
    {
        changed = true;
        updateNormals = false;
        if (normals && normals.length > 0) geom.normals = normals;
        else geom.normals = [];
    }

    if (changed)outGeom.setRef(geom);

    next.trigger();
};
