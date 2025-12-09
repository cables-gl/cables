const
    inGeom = op.inObject("Geometry", null, "threeGeometry"),
    inThresholdAngle = op.inFloatSlider("Threshold Angle", 1, 0, 365),
    outGeom = op.outObject("Wireframe", null, "threeGeometry");

let geometry = null;
let to = null;

inThresholdAngle.onChange =
inGeom.onChange = updateSoon;

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
    geometry = new THREE.EdgesGeometry(
        inGeom.get(),
        inThresholdAngle.get()
    );
    outGeom.setRef(geometry);
}
