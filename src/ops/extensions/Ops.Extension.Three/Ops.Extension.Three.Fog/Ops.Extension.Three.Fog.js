const
    exec = op.inTrigger("Trigger"),
    next = op.outTrigger("Next");
let fog = new THREE.Fog(0xcccccc, 1, 15);

const threeOp = new CABLES.ThreeOp(op);

CABLES.ThreeOp.bindColor(op, fog, "color", { "values": "random" });
CABLES.ThreeOp.bindFloat(op, fog, "near", 1);
CABLES.ThreeOp.bindFloat(op, fog, "far", 30);

exec.onTriggered = () =>
{
    if (threeOp.renderer.scene.fog != fog) threeOp.renderer.scene.fog = fog;
    threeOp.push();

    next.trigger();

    threeOp.pop();
};

threeOp.on("inactive", () =>
{
    console.log("inactive......");
    threeOp.renderer.scene.fog = null;
});
