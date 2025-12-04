let material = new THREE.MeshStandardMaterial();

const exec = op.inTrigger("Trigger");

bind();

const
    inMap = op.inObject("Map", null, "three texture"),
    next = op.outTrigger("Next");

inMap.onChange = recreate;

recreate();

exec.onTriggered = () =>
{
    op.patch.cg.frameStore.three.renderer.pushMaterial(material);
    next.trigger();
    op.patch.cg.frameStore.three.renderer.popMaterial();
};

function bind()
{
    if (!material)recreate();
    CABLES.ThreeOp.bindColor(op, material, "color", { "values": "random" });
    CABLES.ThreeOp.bindFloat(op, material, "metalness", 0);
    CABLES.ThreeOp.bindFloat(op, material, "roughness", 1);
    CABLES.ThreeOp.bindBool(op, material, "flatShading", false, { "needsUpdate": true });
    CABLES.ThreeOp.bindBool(op, material, "wireframe", false, { "needsUpdate": true });
    CABLES.ThreeOp.bindBool(op, material, "fog", true, { "needsUpdate": true });
}

function recreate()
{
    const params = { "color": 0xffff00		 };
    if (inMap.get())params.map = inMap.get();
    material = new THREE.MeshStandardMaterial(params);
    bind();
}
