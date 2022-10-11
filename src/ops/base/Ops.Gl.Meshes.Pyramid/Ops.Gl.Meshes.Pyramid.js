let render = op.inTrigger("Render");

let sizeW = op.inValue("Width", 1);
let sizeL = op.inValue("Length", 1);
let sizeH = op.inValue("Height", 2);

let inSmooth = op.inValueBool("Smooth", false);

let inDraw = op.inValueBool("Draw", true);

let trigger = op.outTrigger("trigger");
let geomOut = op.outObject("geometry");

let geom = null;
let cgl = op.patch.cgl;
let mesh = null;

sizeW.onChange = create;
sizeH.onChange = create;
sizeL.onChange = create;
inSmooth.onChange = create;
create();

render.onTriggered = function ()
{
    if (inDraw.get())mesh.render(cgl.getShader());
    trigger.trigger();
};

function create()
{
    if (!geom)geom = new CGL.Geometry(op.name);
    let w = sizeW.get();
    let h = sizeH.get();
    let l = sizeL.get();

    geom.vertices = [
        // -w,-l,0,
        // w,-l,0,
        // w,l,0,
        // -w,l,0,
        // 0,0,h,
        -w, 0, -l,
        w, 0, -l,
        w, 0, l,
        -w, 0, l,
        0, h, 0
    ];

    geom.vertexNormals = [
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0
    ];

    geom.texCoords = [
        0.5, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        0.0, 1.0,
        0.0, 1.0,
    ];

    geom.verticesIndices = [
        0, 1, 2,
        0, 2, 3, // bottom

        4, 1, 0,
        4, 3, 2,
        0, 3, 4,
        4, 2, 1
    ];

    if (!inSmooth.get())geom.unIndex();
    geom.calculateNormals({ "forceZUp": false });

    mesh = new CGL.Mesh(cgl, geom);
    geomOut.set(null);
    geomOut.set(geom);
}
