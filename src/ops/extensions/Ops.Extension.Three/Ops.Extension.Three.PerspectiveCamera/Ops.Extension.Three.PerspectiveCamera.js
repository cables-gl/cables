const
    exec = op.inTrigger("Trigger"),
    next = op.outTrigger("Next");

const threeOp = new CABLES.ThreeOp(op);
const camera = new THREE.PerspectiveCamera(50, 1.777, 0.001, 100);
threeOp.setSceneObject(camera);

CABLES.ThreeOp.bindFloat(op, camera, "fov", 50, { "needsUpdate": true });
CABLES.ThreeOp.bindFloat(op, camera, "zoom", 1, { "needsUpdate": true });
CABLES.ThreeOp.bindVec(op, camera, "position", { "needsUpdate": true });

CABLES.ThreeOp.bindFloat(op, camera, "near", 0.001, { "needsUpdate": true });
CABLES.ThreeOp.bindFloat(op, camera, "far", 100, { "needsUpdate": true });

let aspect = 1;

exec.onTriggered = () =>
{
    if (!op.patch.cg.frameStore.three) return;
    // threeOp.setSceneObject(camera);

    op.patch.cg.frameStore.three.renderer.currentCamera = camera;
    aspect = op.patch.cg.canvas.width / op.patch.cg.canvas.height;

    if (camera.aspect != aspect)
    {
        camera.aspect = aspect;
        camera.updateProjectionMatrix();
    }
    if (camera.needsUpdate)
    {
        // console.log("text", camera.position);
        camera.updateProjectionMatrix();
        camera.updateMatrixWorld(true);
        threeOp.renderer.scene.updateMatrixWorld();
        // camera.needsUpdate = false;camera.updateMatrixWorld(true) in
    }
    threeOp.push(false);
    next.trigger();
    threeOp.pop();
};
