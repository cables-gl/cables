const
    exec = op.inTrigger("Trigger"),
    myNumber = op.inFloat("Number"),
    inPosX = op.inFloat("Position X"),
    next = op.outTrigger("Next");

const threeOp = new CABLES.ThreeOp(op);

let mesh = null;
let geometry = null;

myNumber.onChange = updateGeom;

function updateGeom()
{
    geometry = new THREE.TorusKnotGeometry(myNumber.get(), 3, 200, 32);
    if (mesh)mesh.geometry = geometry.toNonIndexed();
}

exec.onTriggered = () =>
{
    if (!mesh)
    {
        updateGeom();

        mesh = new THREE.Mesh(geometry.toNonIndexed());
        mesh.scale.x = mesh.scale.y = mesh.scale.z = 0.03;

        threeOp.setSceneObject(mesh);
    }

    mesh.position.set(inPosX.get(), 0, 0);

    threeOp.push();

    if (mesh) mesh.rotation.x += 0.005;
    next.trigger();

    threeOp.pop();
};
