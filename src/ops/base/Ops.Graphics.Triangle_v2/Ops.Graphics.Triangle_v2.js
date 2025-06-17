const
    render = op.inTrigger("render"),
    trigger = op.outTrigger("trigger"),
    sizeW = op.inValueFloat("width", 1),
    sizeH = op.inValueFloat("height", 1),
    draw = op.inValueBool("Draw", true),
    geom = new CGL.Geometry("triangle"),
    geomOut = op.outObject("geometry");

geomOut.ignoreValueSerialize = true;

op.toWorkPortsNeedToBeLinked(render);
op.setPortGroup("Size", [sizeW, sizeH]);

const cgl = op.patch.cgl;
let mesh = null;
sizeW.onChange = sizeH.onChange = () => { mesh = null; };

render.onLinkChanged = () =>
{
    if (!render.isLinked()) geomOut.set(null);
};

render.onTriggered = function ()
{
    if (!mesh)create();
    if (draw.get() && mesh)mesh.render();
    trigger.trigger();
};

function create()
{
    geom.vertices = [
        0.0, sizeH.get(), 0.0,
        -sizeW.get(), -sizeH.get(), 0.0,
        sizeW.get(), -sizeH.get(), 0.0
    ];

    geom.vertexNormals = [
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0
    ];
    geom.tangents = [
        1, 0, 0,
        1, 0, 0,
        1, 0, 0
    ];
    geom.biTangents = [
        0, 1, 0,
        0, 1, 0,
        0, 1, 0
    ];

    geom.texCoords = [
        0.5, 0.0,
        1.0, 1.0,
        0.0, 1.0,
    ];

    geom.verticesIndices = [
        0, 1, 2
    ];

    mesh = op.patch.cg.createMesh(geom, { "opId": op.id });
    geomOut.setRef(geom);
}
