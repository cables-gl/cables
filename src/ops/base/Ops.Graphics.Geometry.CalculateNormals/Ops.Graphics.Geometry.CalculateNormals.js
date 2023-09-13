const
    geometry = op.inObject("Geometry"),
    smoothNormals = op.inValueBool("Smooth"),
    forceZUp = op.inValueBool("Force Z Up"),
    geomOut = op.outObject("Geometry Out");

op.toWorkPortsNeedToBeLinked(geometry);
geomOut.ignoreValueSerialize = true;
geometry.ignoreValueSerialize = true;

geometry.onChange =
    smoothNormals.onChange =
    forceZUp.onChange = calc;

let geom = null;

function calc()
{
    if (!geometry.get()) return;

    let geom = geometry.get().copy();

    if (!smoothNormals.get())geom.unIndex();

    geom.calculateNormals({
        "forceZUp": forceZUp.get()
    });

    geomOut.setRef(geom);
}
