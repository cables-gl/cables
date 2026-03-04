const
    inGeoms = op.inMultiPort2("Strings", CABLES.OP_PORT_TYPE_OBJECT, null, 3),

    outGeom = op.outObject("Geometry Result");

let geom = new CGL.Geometry(op.name);
outGeom.set(geom);

inGeoms.onChange = () =>
{
    let geom = null;
    const geomPorts = inGeoms.get();

    for (let i = 0; i < geomPorts.length; i++)
    {
        if (geomPorts[i].get())
            if (!geom)geom = geomPorts[i].get().copy();
            else geom.merge(geomPorts[i].get());
    }

    outGeom.set(geom);
};
