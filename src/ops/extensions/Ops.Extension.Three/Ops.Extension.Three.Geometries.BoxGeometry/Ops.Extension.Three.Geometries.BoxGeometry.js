const
    inW = op.inFloat("Width", 0.4),
    inH = op.inFloat("Height", 0.4),
    inD = op.inFloat("Depth", 0.4),
    inWSegments = op.inInt("Width Segments", 1),
    inHSegments = op.inInt("Height Segments", 1),
    inDSegments = op.inInt("Depth Segments", 1),
    outGeom = op.outObject("geometry", null, "threeGeometry");

let geometry = null;
let to = null;

inW.onChange =
inH.onChange =
inD.onChange =
inWSegments.onChange =
inHSegments.onChange =
inDSegments.onChange = updateSoon;

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
    geometry = new THREE.BoxGeometry(
        inW.get(),
        inH.get(),
        inD.get(),
        inWSegments.get(),
        inHSegments.get(),
        inDSegments.get()
    );
    outGeom.setRef(geometry);
}
