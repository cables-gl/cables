const
    render = op.inTrigger("Render"),
    x1 = op.inValue("X 1"),
    y1 = op.inValue("Y 1"),
    z1 = op.inValue("Z 1"),
    x2 = op.inValue("X 2", 1),
    y2 = op.inValue("Y 2", 1),
    z2 = op.inValue("Z 2", 1),
    next = op.outTrigger("Next"),
    outArr = op.outArray("Array");

const cgl = op.patch.cgl;
const arr = [0, 0, 0, 0, 0, 0];
const geom = new CGL.Geometry("simplespline");
geom.vertices = [x1.get(), y1.get(), z1.get(), x2.get(), y2.get(), x2.get()];
const mesh = new CGL.Mesh(cgl, geom, { "glPrimitive": cgl.gl.LINES });

let changed = true;

x1.onChange = function () { arr[0] = geom.vertices[0] = x1.get(); changed = true; };
y1.onChange = function () { arr[1] = geom.vertices[1] = y1.get(); changed = true; };
z1.onChange = function () { arr[2] = geom.vertices[2] = z1.get(); changed = true; };

x2.onChange = function () { arr[3] = geom.vertices[3] = x2.get(); changed = true; };
y2.onChange = function () { arr[4] = geom.vertices[4] = y2.get(); changed = true; };
z2.onChange = function () { arr[5] = geom.vertices[5] = z2.get(); changed = true; };

render.onTriggered = function ()
{
    if (changed)
    {
        mesh.updateVertices(geom);
        outArr.setRef(arr);
        changed = false;
    }

    let shader = cgl.getShader();
    mesh.render(shader);

    next.trigger();
};
