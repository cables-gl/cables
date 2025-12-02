const
    exec = op.inTrigger("Trigger"),
    inShadowMap = op.inBool("ShadowMap", false),
    inClear = op.inBool("Clear", false),
    inMat = op.inBool("Cables Matrices", false),
    next = op.outTrigger("Next");

let camera = null;
const renderer = new CABLES.ThreeRenderer(op);

exec.onTriggered = () =>
{
    renderer.renderPre();
    renderer.renderer.autoClear = inClear.get();
    renderer.renderer.shadowMap.enabled = inShadowMap.get();
    // renderer.renderer.shadowMap.type = THREE.BasicShadowMap;// THREE.PCFShadowMap;
    renderer.renderer.shadowMap.type = THREE.PCFShadowMap;
    if (inMat.get())setCablesViewMatrix();

    next.trigger();
    renderer.render();
};

function setCablesViewMatrix()
{
    if (!camera) camera = new THREE.PerspectiveCamera(120, 1.777, 0.001, 100);
    op.patch.cg.frameStore.three.renderer.currentCamera = camera;

    camera.matrixAutoUpdate = false;

    const view = new THREE.Matrix4().fromArray(op.patch.cg.vMatrix);
    const cameraWorld = new THREE.Matrix4().copy(view).invert();

    camera.matrixWorld.copy(cameraWorld);

    camera.matrixWorldInverse.copy(view);
}
