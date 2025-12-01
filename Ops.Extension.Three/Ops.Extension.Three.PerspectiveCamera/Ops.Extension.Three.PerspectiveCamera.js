const
    exec = op.inTrigger("Trigger"),
    inR = op.inFloatSlider("Color R", 0),
    inG = op.inFloatSlider("Color G", 0),
    inB = op.inFloatSlider("Color B", 0),
    next = op.outTrigger("Next");

const threeOp = new CABLES.ThreeOp(op);
const camera = new THREE.PerspectiveCamera(120, 1.777, 0.1, 10);
threeOp.setSceneObject(camera);

inR.onChange =
inG.onChange =
inB.onChange = () =>
{
};

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
