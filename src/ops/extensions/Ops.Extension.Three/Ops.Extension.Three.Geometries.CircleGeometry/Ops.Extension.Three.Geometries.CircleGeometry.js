const
    inRadius = op.inFloat("Radius", 1),
    inSegments = op.inFloat("Segments", 32),
    inThetaStart = op.inFloatSlider("Theta Start", 0, 0, 1),
    inThetaLength = op.inFloatSlider("Theta Length", 1, 0, 1),
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
    // test live change
    clearTimeout(to);
    to = setTimeout(() =>
    {
        update();
    }, 17);
}

function update()
{
    const thetaLength = inThetaLength.get() * (Math.PI * 2);
    const thetaStart = inThetaStart.get() * (Math.PI * 2);
    geometry = new THREE.CircleGeometry(inRadius.get(), inSegments.get(), thetaStart, thetaLength);
    outGeom.setRef(geometry);
}
