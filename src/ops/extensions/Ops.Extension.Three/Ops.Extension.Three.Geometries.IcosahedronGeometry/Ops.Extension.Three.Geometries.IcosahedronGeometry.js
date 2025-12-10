const
    inRadius = op.inFloat("Radius", 1),
    inDetail = op.inInt("Detail", 0),
    outGeom = op.outObject("geometry", null, "threeGeometry");

let geometry = null;
let to = null;

inRadius.onChange =
inDetail.onChange = updateSoon;

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
    geometry = new THREE.IcosahedronGeometry(
        inRadius.get(),
        inDetail.get()
    );
    outGeom.setRef(geometry);
}
