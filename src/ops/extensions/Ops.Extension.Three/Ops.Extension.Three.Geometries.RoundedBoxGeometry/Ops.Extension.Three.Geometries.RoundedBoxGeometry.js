const
    inW = op.inFloat("Width", 0.4),
    inH = op.inFloat("Height", 0.4),
    inD = op.inFloat("Depth", 0.4),
    inSegments = op.inInt("Segments", 2),
    inRadius = op.inFloatSlider("Radius", 0.1, 0, 1),
    outGeom = op.outObject("geometry", null, "threeGeometry");

let geometry = null;
let to = null;

inW.onChange =
inH.onChange =
inD.onChange =
inSegments.onChange =
inRadius.onChange = updateSoon;

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
    geometry = new THREE.ADDONS.RoundedBoxGeometry(
        inW.get(),
        inH.get(),
        inD.get(),
        inSegments.get(),
        inRadius.get()
    );
    outGeom.setRef(geometry);
}
