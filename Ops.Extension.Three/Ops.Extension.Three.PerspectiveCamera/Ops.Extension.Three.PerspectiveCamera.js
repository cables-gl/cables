const
    exec = op.inTrigger("Trigger"),
    next = op.outTrigger("Next");

const threeOp = new CABLES.ThreeOp(op);
const camera = new THREE.PerspectiveCamera(50, 1.777, 0.001, 100);
threeOp.setSceneObject(camera);

let aspect = 1;

exec.onTriggered = () =>
{
    // threeOp.check();
    if (!op.patch.cg.frameStore.three) return;
    // op.patch.cg.frameStore.three.renderer.pushCamera(camera);
    op.patch.cg.frameStore.three.renderer.currentCamera = camera;
    aspect = op.patch.cg.canvas.width / op.patch.cg.canvas.height;
    if (camera.aspect != aspect)
    {
        camera.aspect = aspect;
        camera.updateProjectionMatrix();
    }

    threeOp.push();

    next.trigger();

    threeOp.pop();

    // op.patch.cg.frameStore.three.renderer.popCamera();
};
