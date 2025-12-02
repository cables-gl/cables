const
    exec = op.inTrigger("Trigger"),
    inPosX = op.inFloat("Position X"),
    inScale = op.inFloat("Scale"),
    inRot = op.inBool("Rot", false),
    inGeo = op.inObject("Geometry", null, "threeGeometry"),
    next = op.outTrigger("Next");

const threeOp = new CABLES.ThreeOp(op);

let mesh = null;
let geometry = null;
// myNumber.onChange = updateGeom;

// function updateGeom()
// {
//     // geometry = new THREE.TorusKnotGeometry(myNumber.get(), 3, 200, 32);
//     // if (mesh)mesh.geometry = geometry.toNonIndexed();
// }
inGeo.onLinkChanged =
inGeo.onChange = updateGeom;

function updateGeom()
{
    geometry = inGeo.get();
}

exec.onTriggered = () =>
{
    if (!mesh)
    {
        updateGeom();

        mesh = new THREE.Mesh(geometry || threeOp.renderer.defaultGeometry);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        threeOp.setSceneObject(mesh);
    }
    if (mesh.geometry != geometry)
    {
        mesh.geometry = geometry || threeOp.renderer.defaultGeometry;
    }

    mesh.position.set(inPosX.get(), 0, 0);
    mesh.scale.x = mesh.scale.y = mesh.scale.z = inScale.get();

    threeOp.push();

    if (inRot.get() && mesh) mesh.rotation.x += 0.005;
    next.trigger();

    threeOp.pop();
};
