const
    exec = op.inTrigger("Trigger"),
    inGeom = op.inObject("Geometry", null, "threeGeometry"),
    next = op.outTrigger("Next");

const threeOp = new CABLES.ThreeOp(op);

let obj = null;
let to = null;

inGeom.onChange = updateSoon;

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
    const geom = inGeom.get() || undefined; // set to undefined to use default geom from constructor
    obj = new THREE.LineSegments(geom, threeOp.renderer.currentMaterial);
    threeOp.setSceneObject(obj);
}

exec.onTriggered = () =>
{
    if (!obj) update();

    threeOp.push();
    next.trigger();
    threeOp.pop();
};
