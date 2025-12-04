const
    exec = op.inTrigger("Trigger"),
    next = op.outTrigger("Next");

const threeOp = new CABLES.ThreeOp(op);
const camera = new THREE.PerspectiveCamera(120, 1.777, 0.001, 100);
threeOp.setSceneObject(camera);

exec.onTriggered = () =>
{
    // threeOp.check();
    if (!op.patch.cg.frameStore.three) return;
    // op.patch.cg.frameStore.three.renderer.pushCamera(camera);
    op.patch.cg.frameStore.three.renderer.currentCamera = camera;

    threeOp.push();

    next.trigger();

    threeOp.pop();

    // op.patch.cg.frameStore.three.renderer.popCamera();
};
