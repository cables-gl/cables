const
    inRadius = op.inFloat("Radius", 1),
    inHeight = op.inFloat("Height", 1),
    inCapSegments = op.inFloat("Cap Segments", 4),
    inRadialSegments = op.inFloat("Radial Segments", 8),
    inHeightSegments = op.inFloat("Height Segments", 1),
    outGeom = op.outObject("geometry", null, "threeGeometry");

let geometry = null;
let to = null;

inRadius.onChange =
inHeight.onChange =
inCapSegments.onChange =
inRadialSegments.onChange =
inHeightSegments.onChange = updateSoon;

updateSoon();

function updateSoon()
{
    clearTimeout(to);
    to = setTimeout(() =>
    {
        update();
    }, 17);
}

function update()
{
    geometry = new THREE.CapsuleGeometry(inRadius.get(), inHeight.get(), inCapSegments.get(), inRadialSegments.get(), inHeightSegments.get());
    outGeom.setRef(geometry);
}
