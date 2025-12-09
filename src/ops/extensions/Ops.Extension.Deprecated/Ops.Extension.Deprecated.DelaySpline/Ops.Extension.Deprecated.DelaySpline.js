op.name = "DelaySpline";

let render = op.inTrigger("render");
let x = op.inValue("X");
let y = op.inValue("Y");
let z = op.inValue("Z");

let next = op.outTrigger("next");
let cgl = op.patch.cgl;

let queue = [];
queue.length = 300 * 3;

render.onTriggered = doRender;

setInterval(store, 10);

let geom = null;
let mesh = null;

function store()
{
    queue.shift();
    queue.shift();
    queue.shift();

    queue.push(x.get());
    queue.push(y.get());
    queue.push(z.get());

    if (!geom)
    {
        geom = new CGL.Geometry();

        geom.texCoords.length = 0;
        geom.verticesIndices.length = 0;
        for (i = 0; i < queue; i += 3)
        {
            geom.texCoords.push(0);
            geom.texCoords.push(0);
            geom.verticesIndices.push(i / 3);
        }
    }

    geom.vertices = queue;

    if (!mesh) mesh = new CGL.Mesh(cgl, geom);
    else mesh.setGeom(geom);
}

function doRender()
{
    let shader = cgl.getShader();
    if (!shader) return;
    if (!mesh) return;

    let oldPrim = shader.glPrimitive;
    shader.glPrimitive = cgl.gl.LINE_STRIP;

    cgl.gl.lineWidth(2);

    mesh.render(shader);
    shader.glPrimitive = oldPrim;

    next.trigger();
}
