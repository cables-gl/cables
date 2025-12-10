let material = new THREE.MeshPhongMaterial();

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
    CABLES.ThreeOp.bindBool(op, material, "flatShading", false, { "needsUpdate": true });
    CABLES.ThreeOp.bindBool(op, material, "wireframe", false, { "needsUpdate": true });
    CABLES.ThreeOp.bindBool(op, material, "fog", true, { "needsUpdate": true });
}

function recreate()
{
    const params = { "color": 0xffff00, "fog": true		 };
    if (inMap.get())params.map = inMap.get();
    material = new THREE.MeshNormalMaterial(params);
    bind();
}
