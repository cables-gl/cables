const
    inRadius = op.inFloat("Radius", 1),
    inRadiusBottom = op.inFloat("Radius Bottom", 1),
    inHeight = op.inFloat("Height", 1),
    inRadialSegments = op.inInt("Radial Segments", 32),
    inHeightSegments = op.inInt("Height Segments", 1),
    inOpenEnded = op.inBool("Open Ended", false),
    inThetaStart = op.inFloatSlider("Theta Start", 0, 0, 1),
    inThetaLength = op.inFloatSlider("Theta Length", 1, 0, 1),
    outGeom = op.outObject("geometry", null, "threeGeometry");

let geometry = null;
let to = null;

inRadius.onChange =
inRadiusBottom.onChange =
inHeight.onChange =
inRadialSegments.onChange =
inHeightSegments.onChange =
inOpenEnded.onChange =
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
    const thetaStart = inThetaStart.get() * (Math.PI * 2);
    const thetaLength = inThetaLength.get() * (Math.PI * 2);

    geometry = new THREE.CylinderGeometry(
        inRadius.get(),
        inRadiusBottom.get(),
        inHeight.get(),
        inRadialSegments.get(),
        inHeightSegments.get(),
        inOpenEnded.get(),
        thetaStart,
        thetaLength
    );
    outGeom.setRef(geometry);
}
