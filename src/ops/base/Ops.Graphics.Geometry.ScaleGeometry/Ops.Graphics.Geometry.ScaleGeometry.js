const
    geometry = op.inObject("Geometry"),
    inMeth = op.inSwitch("Method", ["Factor", "Target Size X", "Target Size Y", "Target Size Z"], "Factor"),
    scale = op.inValue("Scale", 1),

    scaleX = op.inValue("Multiply X", 1),
    scaleY = op.inValue("Multiply Y", 1),
    scaleZ = op.inValue("Multiply Z", 1),
    outGeom = op.outObject("Result", null, "geometry");

op.setUiAxisPorts(scaleX, scaleY, scaleZ);

scaleX.onChange =
    scaleY.onChange =
    scaleZ.onChange =
    scale.onChange =
    geometry.onChange = update;

inMeth.onChange = () =>
{
    if (CABLES.UI)
    {
        scale.setUiAttribs({ "title": inMeth.get() });
        scale.setUiAttribs({ "title": inMeth.get() });
    }
    update();
};

function update()
{
    let oldGeom = geometry.get();

    if (oldGeom)
    {
        let geom = oldGeom.copy();
        let s = scale.get();
        let sx = scaleX.get();
        let sy = scaleY.get();
        let sz = scaleZ.get();

        if (inMeth.get().includes("Target Size"))
        {
            const bb = new CGL.BoundingBox(oldGeom);
            if (inMeth.get() == "Target Size X") s /= bb.size[0];
            if (inMeth.get() == "Target Size Y") s /= bb.size[1];
            if (inMeth.get() == "Target Size Z") s /= bb.size[2];
        }

        for (let i = 0; i < geom.vertices.length; i += 3)
        {
            geom.vertices[i + 0] *= s * sx;
            geom.vertices[i + 1] *= s * sy;
            geom.vertices[i + 2] *= s * sz;
        }

        outGeom.setRef(geom);
    }
    else outGeom.setRef(null);
}
