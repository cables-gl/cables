const
    render = op.inTrigger("render"),

    x1 = op.inValue("x 1", -1),
    y1 = op.inValue("y 1", 1),
    z1 = op.inValue("z 1", 0),

    x2 = op.inValue("x 2", 1),
    y2 = op.inValue("y 2", 1),
    z2 = op.inValue("z 2", 0),

    x3 = op.inValue("x 3", -1),
    y3 = op.inValue("y 3", -1),
    z3 = op.inValue("z 3", 0),

    x4 = op.inValue("x 4", 1),
    y4 = op.inValue("y 4", -1),
    z4 = op.inValue("z 4", 0),

    tcx1 = op.inValue("tc x 1", 0),
    tcy1 = op.inValue("tc y 1", 1),

    tcx2 = op.inValue("tc x 2", 1),
    tcy2 = op.inValue("tc y 2", 1),

    tcx3 = op.inValue("tc x 3", 0),
    tcy3 = op.inValue("tc y 3", 0),

    tcx4 = op.inValue("tc x 4", 1),
    tcy4 = op.inValue("tc y 4", 0),
    trigger = op.outTrigger("trigger");

let geom = new CGL.Geometry(op.name);
let mesh = null;
let cgl = op.patch.cgl;

let arrverts = [];
arrverts.length = 12;
let verts = new Float32Array(arrverts);
let indices = [2, 1, 0, 1, 2, 3];
let tc = new Float32Array([0, 0, 0, 0, 0, 0, 0, 0]);

let geomOut = op.addOutPort(new CABLES.Port(op, "geometry", CABLES.OP_PORT_TYPE_OBJECT));
geomOut.ignoreValueSerialize = true;

tcx1.onChange =
    tcy1.onChange =
    tcx2.onChange =
    tcy2.onChange =
    tcx3.onChange =
    tcy3.onChange =
    tcx4.onChange =
    tcy4.onChange =
    x1.onChange =
    x2.onChange =
    x3.onChange =
    x4.onChange =
    y1.onChange =
    y2.onChange =
    y3.onChange =
    y4.onChange =
    z1.onChange =
    z2.onChange =
    z3.onChange =
    z4.onChange = rebuild;

rebuild();

render.onTriggered = function ()
{
    mesh.render(cgl.getShader());

    if (op.isCurrentUiOp())
    {
        gui.setTransformGizmo({ "posX": x1, "posY": y1, "posZ": z1 }, 0);
        gui.setTransformGizmo({ "posX": x2, "posY": y2, "posZ": z2 }, 1);
        gui.setTransformGizmo({ "posX": x3, "posY": y3, "posZ": z3 }, 2);
        gui.setTransformGizmo({ "posX": x4, "posY": y4, "posZ": z4 }, 3);
    }

    trigger.trigger();
};

function rebuild()
{
    verts[0] = x1.get();
    verts[1] = y1.get();
    verts[2] = z1.get();

    verts[3] = x2.get();
    verts[4] = y2.get();
    verts[5] = z2.get();

    verts[6] = x3.get();
    verts[7] = y3.get();
    verts[8] = z3.get();

    verts[9] = x4.get();
    verts[10] = y4.get();
    verts[11] = z4.get();

    // var tc=[0,0, 1,0, 0,1,  1,1];

    tc[0] = tcx1.get();
    tc[1] = tcy1.get();

    tc[2] = tcx2.get();
    tc[3] = tcy2.get();

    tc[4] = tcx3.get();
    tc[5] = tcy3.get();

    tc[6] = tcx4.get();
    tc[7] = tcy4.get();

    geom.vertices = verts;
    geom.texCoords = tc;
    geom.verticesIndices = indices;
    geom.calcNormals(true);
    geom.calcTangentsBitangents();

    if (!mesh) mesh = new CGL.Mesh(cgl, geom);
    else mesh.setGeom(geom);

    geomOut.set(null);
    geomOut.set(geom);
}
