const
    exec = op.inTrigger("Trigger"),
    next = op.outTrigger("Next");

const threeOp = new CABLES.ThreeOp(op);
const container = new THREE.Object3D();

let init = true;
let light = new THREE.AmbientLight(0xffffff, 4);
container.add(light);

CABLES.ThreeOp.bindFloat(op, light, "intensity", 1);
CABLES.ThreeOp.bindColor(op, light, "color");

exec.onTriggered = () =>
{
    if (init)
    {
        threeOp.setSceneObject(container);
        init = false;
    }

    threeOp.push();
    next.trigger();
    threeOp.pop();
};
