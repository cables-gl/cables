// from: http://blog.andreaskahler.com/search/label/3D

const
    render = op.inTrigger("render"),
    smooth = op.inValueBool("smooth"),
    trigger = op.outTrigger("trigger"),
    geomOut = op.outObject("geometry");

geomOut.ignoreValueSerialize = true;

smooth.onChange = generate;

const cgl = op.patch.cgl;
let geom = new CGL.Geometry(op.name);
let mesh = null;
smooth.set(false);
generate();

render.onTriggered = function ()
{
    if (!mesh) mesh = new CGL.Mesh(cgl, geom);
    if (mesh) mesh.render(cgl.getShader());
    trigger.trigger();
};

function generate()
{
    let t = Math.sqrt(5.0) / 2;
    let tc = [];
    let verts = [];
    verts.push(-1, t, 0);
    verts.push(1, t, 0);
    verts.push(-1, -t, 0);
    verts.push(1, -t, 0);

    verts.push(0, -1, t);
    verts.push(0, 1, t);
    verts.push(0, -1, -t);
    verts.push(0, 1, -t);

    verts.push(t, 0, -1);
    verts.push(t, 0, 1);
    verts.push(-t, 0, -1);
    verts.push(-t, 0, 1);

    geom = new CGL.Geometry(op.name);
    geom.vertices = verts;
    geom.verticesIndices = [];

    // 5 faces around point 0
    geom.verticesIndices.push(0, 11, 5);
    geom.verticesIndices.push(0, 5, 1);
    geom.verticesIndices.push(0, 1, 7);
    geom.verticesIndices.push(0, 7, 10);
    geom.verticesIndices.push(0, 10, 11);

    // 5 adjacent faces
    geom.verticesIndices.push(1, 5, 9);
    geom.verticesIndices.push(5, 11, 4);
    geom.verticesIndices.push(11, 10, 2);
    geom.verticesIndices.push(10, 7, 6);
    geom.verticesIndices.push(7, 1, 8);

    // 5 faces around point 3
    geom.verticesIndices.push(3, 9, 4);
    geom.verticesIndices.push(3, 4, 2);
    geom.verticesIndices.push(3, 2, 6);
    geom.verticesIndices.push(3, 6, 8);
    geom.verticesIndices.push(3, 8, 9);

    // 5 adjacent faces
    geom.verticesIndices.push(4, 9, 5);
    geom.verticesIndices.push(2, 4, 11);
    geom.verticesIndices.push(6, 2, 10);
    geom.verticesIndices.push(8, 6, 7);
    geom.verticesIndices.push(9, 8, 1);

    geom.texCoords = tc;

    geom.calcNormals(smooth.get());

    geomOut.set(geom);
}
