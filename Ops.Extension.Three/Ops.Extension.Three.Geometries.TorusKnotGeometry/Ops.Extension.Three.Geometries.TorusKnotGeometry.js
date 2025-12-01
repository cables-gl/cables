const
    inRadius = op.inFloat("Radius", 1),
    inTube = op.inFloat("Tube", 0.4),
    inTubularSegments = op.inFloat("tubularSegments", 120),
    inRadialSegments = op.inFloat("radialSegments", 12),
    inP = op.inInt("Rot Winds", 2),
    inQ = op.inInt("Interior Winds", 3),
    outGeom = op.outObject("geometry", null, "threeGeometry");

let geometry = null;

inRadius.onChange =
    inP.onChange =
    inQ.onChange =
    inTubularSegments.onChange =
    inRadialSegments.onChange =
    inTube.onChange = updateSoon;

updateSoon();

function updateSoon()
{
    update();
}

function update()
{
    geometry = new THREE.TorusKnotGeometry(inRadius.get(), inTube.get(),
        inTubularSegments.get(), inRadialSegments.get(), inP.get(), inQ.get());
    outGeom.setRef(geometry);
}
