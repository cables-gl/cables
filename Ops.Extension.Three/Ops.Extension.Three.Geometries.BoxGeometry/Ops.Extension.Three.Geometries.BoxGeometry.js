const
    inW = op.inFloat("Width", 0.4),
    inH = op.inFloat("Height", 0.4),
    inD = op.inFloat("Depth", 0.4),
    outGeom = op.outObject("geometry", null, "threeGeometry");

let geometry = null;

inW.onChange =
    inH.onChange =
    inD.onChange = updateSoon;

updateSoon();

function updateSoon()
{
    update();
}

function update()
{
    geometry = new THREE.BoxGeometry(inW.get(), inH.get(), inD.get());
    outGeom.setRef(geometry);
}
