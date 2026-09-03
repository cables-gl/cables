const
    geometry = op.inObject("Geometry"),
    smoothNormals = op.inBool("Smooth"),
    forceZUp = op.inBool("Force Z Up"),
    geomOut = op.outObject("Geometry Out", null, "geometry");

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

    if (!smoothNormals.get()) geom.unIndex();

    geom.calculateNormals(
        {
            "forceZUp": forceZUp.get()
        });

    geomOut.setRef(geom);
}
