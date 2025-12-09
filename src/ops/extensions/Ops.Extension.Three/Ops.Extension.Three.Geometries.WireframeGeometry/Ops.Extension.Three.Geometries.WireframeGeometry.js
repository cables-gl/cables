const
    inGeom = op.inObject("Geometry", null, "threeGeometry"),
    outGeom = op.outObject("Wireframe", null, "threeGeometry");

let geometry = null;
let to = null;

inGeom.onChange = updateSoon;

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
    geometry = new THREE.WireframeGeometry(
        inGeom.get()
    );
    outGeom.setRef(geometry);
}
