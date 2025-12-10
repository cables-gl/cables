const
    inW = op.inFloat("Width", 0.4),
    inH = op.inFloat("Height", 0.4),
    inWSegments = op.inInt("Width Segments", 1),
    inHSegments = op.inInt("Height Segments", 1),
    outGeom = op.outObject("geometry", null, "threeGeometry");

let geometry = null;
let to = null;

inW.onChange =
inH.onChange =
inWSegments.onChange =
inHSegments.onChange = updateSoon;

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
    geometry = new THREE.PlaneGeometry(
        inW.get(),
        inH.get(),
        inWSegments.get(),
        inHSegments.get(),
    );
    outGeom.setRef(geometry);
}
