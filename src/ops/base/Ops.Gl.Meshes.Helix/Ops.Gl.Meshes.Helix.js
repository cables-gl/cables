
let render = op.inTrigger("render");

let draw = op.inBool("Draw", true);
let segments = op.inValue("Segments", 40);
let freq = op.inValue("Frequency", 1);
let radius = op.inValue("Radius", 1);
let radiusEnd = op.inValue("Radius End", 1);
let height = op.inValue("Height");

let next = op.outTrigger("Next");
let outPoints = op.outArray("Points");

let cgl = op.patch.cgl;
let pos = [];
let needsCalc = true;
let mesh = null;

segments.onChange = calcLater;
radius.onChange = calcLater;
height.onChange = calcLater;
freq.onChange = calcLater;
radiusEnd.onChange = calcLater;
draw.onChange = calcLater;

render.onTriggered = doRender;

function doRender()
{
    if (needsCalc)calc();

    if (mesh)
    {
        let shader = cgl.getShader();
        if (!shader) return;
        let oldPrim = shader.glPrimitive;
        shader.glPrimitive = cgl.gl.LINE_STRIP;
        mesh.render(shader);
        shader.glPrimitive = oldPrim;
    }

    next.trigger();
}

function calcLater()
{
    needsCalc = true;
}

function calc()
{
    needsCalc = false;
    pos.length = 0;

    let i = 0, degInRad = 0;
    let segs = Math.floor(segments.get());
    if (segs < 1)segs = 1;

    for (i = 0; i < segs; i++)
    {
        let perc = (i / segs);
        let z = perc * height.get();
        let rad = (perc * radiusEnd.get()) + ((1.0 - perc) * radius.get());
        degInRad = (360 / segs) * i * CGL.DEG2RAD;
        pos.push(
            Math.sin(degInRad * freq.get()) * rad,
            Math.cos(degInRad * freq.get()) * rad,
            z);
    }

    if (draw.get())
    {
        let buff = new Float32Array(pos);
        let geom = new CGL.Geometry("helix");
        geom.vertices = buff;

        mesh = new CGL.Mesh(cgl, geom);
    }
    else mesh = null;

    outPoints.set(null);
    outPoints.set(pos);
}
