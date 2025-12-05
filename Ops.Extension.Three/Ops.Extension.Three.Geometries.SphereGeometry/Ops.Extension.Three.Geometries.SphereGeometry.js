const
    inRadius = op.inFloat("Radius", 1),
    inWidthSegments = op.inInt("Width Segments", 32),
    inHeightSegments = op.inInt("Height Segments", 16),
    inPhiStart = op.inFloatSlider("Phi Start", 0, 0, 1),
    inPhiLength = op.inFloatSlider("Phi Length", 1, 0, 1),
    inThetaStart = op.inFloatSlider("Theta Start", 0, 0, 1),
    inThetaLength = op.inFloatSlider("Theta Length", 1, 0, 1),
    outGeom = op.outObject("geometry", null, "threeGeometry");

let geometry = null;
let to = null;

inRadius.onChange =
inWidthSegments.onChange =
inHeightSegments.onChange =
inPhiStart.onChange =
inPhiLength.onChange =
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
    const phiStart = inPhiStart.get() * (Math.PI * 2);
    const phiLength = inPhiLength.get() * (Math.PI * 2);

    const thetaStart = inThetaStart.get() * (Math.PI * 2);
    const thetaLength = inThetaLength.get() * (Math.PI * 2);

    geometry = new THREE.SphereGeometry(
        inRadius.get(),
        inWidthSegments.get(),
        inHeightSegments.get(),
        phiStart,
        phiLength,
        thetaStart,
        thetaLength
    );
    outGeom.setRef(geometry);
}
