let render = op.inTrigger("Render");
let inArr = op.inArray("Points");
let next = op.outTrigger("Next");
let geomOut = op.outObject("Geometry");

let geom = new CGL.Geometry("triangle array");

let mesh = null;

let cgl = op.patch.cgl;

inArr.onChange = function ()
{
    let verts = inArr.get();
    geom.vertices = verts;

    mesh = new CGL.Mesh(cgl, geom);
    // geom.calcNormals(false);
    // mesh.setGeom(geom);
    geomOut.set(null);
    geomOut.set(geom);
};

render.onTriggered = function ()
{
    if (mesh)mesh.render(cgl.getShader());
    next.trigger();
};
