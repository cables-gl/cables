const threeOp = new CABLES.ThreeOp(op);
const
    exec = op.inTrigger("Trigger"),
    next = op.outTrigger("Next");

let light = new THREE.PointLight(0xffffff, 1, 100);

bind();

threeOp.setSceneObject(light);

function bind()
{
    if (!light) return;
    CABLES.ThreeOp.bindFloat(op, light, "intensity", 1);
    CABLES.ThreeOp.bindVec(op, light, "position");
    CABLES.ThreeOp.bindColor(op, light, "color");
    CABLES.ThreeOp.bindBool(op, light, "castShadow", true);

    light.shadow.camera.top = 5;
    light.shadow.camera.bottom = -5;
    light.shadow.camera.left = -5;
    light.shadow.camera.right = 5;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 35;
    light.shadow.bias = 0.0001;

    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
}

exec.onTriggered = () =>
{
    threeOp.push(false);
    next.trigger();
    threeOp.pop();
};
