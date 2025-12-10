const
    exec = op.inTrigger("Trigger"),
    inPosX = op.inFloat("Position X"),
    inScale = op.inFloat("Scale"),
    inGeo = op.inObject("Geometry", null, "threeGeometry"),
    next = op.outTrigger("Next");

const threeOp = new CABLES.ThreeOp(op);

let lines = null;
let geometry = null;

inGeo.onChange = updateGeom;

function updateGeom()
{
    geometry = inGeo.get();
}

exec.onTriggered = () =>
{
    if (!lines)
    {
        updateGeom();

        lines = new THREE.LineSegments(geometry || threeOp.renderer.defaultGeometry, threeOp.renderer.currentMaterial);
        threeOp.setSceneObject(lines);
    }

    if (lines.geometry != geometry)
    {
        lines.geometry = geometry || threeOp.renderer.defaultGeometry;
    }

    lines.position.set(inPosX.get(), 0, 0);
    lines.scale.x = lines.scale.y = lines.scale.z = inScale.get();

    threeOp.push();
    next.trigger();
    threeOp.pop();
};
