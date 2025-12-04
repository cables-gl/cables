const
    inRadius = op.inFloat("Radius", 1),
    inSegments = op.inFloat("Segments", 32),
    inThetaStart = op.inFloat("Theta Start", 0),
    inThetaLength = op.inFloat("Theta Length", Math.PI * 2),
    outGeom = op.outObject("geometry", null, "threeGeometry");

let geometry = null;
let to = null;

inRadius.onChange =
inSegments.onChange =
inThetaStart.onChange =
inThetaLength.onChange = updateSoon;

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
    geometry = new THREE.CircleGeometry(inRadius.get(), inSegments.get(), inThetaStart.get(), inThetaLength.get());
    outGeom.setRef(geometry);
}
