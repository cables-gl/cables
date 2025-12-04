const
    inRadius = op.inFloat("Radius", 1),
    inHeight = op.inFloat("Height", 1),
    inCurveSegments = op.inFloat("Curve Segments", 4),
    inRadialSegments = op.inFloat("Radial Segments", 8),
    inHeightSegments = op.inFloat("Height Segments", 1),
    outGeom = op.outObject("geometry", null, "threeGeometry");

let geometry = null;
let to = null;

inRadius.onChange =
inHeight.onChange =
inCurveSegments.onChange =
inRadialSegments.onChange =
inHeightSegments.onChange = updateSoon;

updateSoon();

function updateSoon()
{
    clearTimeout(to);
    to = setTimeout(() =>
    {
        update();
    }, 30);
}

function update()
{
    geometry = new THREE.CapsuleGeometry(inRadius.get(), inHeight.get(), inCurveSegments.get(), inRadialSegments.get(), inHeightSegments.get());
    outGeom.setRef(geometry);
}
