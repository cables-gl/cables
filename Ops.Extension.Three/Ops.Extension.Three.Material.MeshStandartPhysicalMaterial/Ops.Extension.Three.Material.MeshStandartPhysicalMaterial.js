let material = new THREE.MeshStandardMaterial();

const exec = op.inTrigger("Trigger");

bind();

const
    next = op.outTrigger("Next");

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
    CABLES.ThreeOp.bindObject(op, material, "map", "three texture", { "needsUpdate": true });
    CABLES.ThreeOp.bindObject(op, material, "aoMap", "three texture", { "needsUpdate": true });
    CABLES.ThreeOp.bindFloat(op, material, "aoMapIntensity", 1);
    CABLES.ThreeOp.bindObject(op, material, "alphaMap", "three texture", { "needsUpdate": true });
    CABLES.ThreeOp.bindObject(op, material, "bumpMap", "three texture", { "needsUpdate": true });
    CABLES.ThreeOp.bindObject(op, material, "displacementMap", "three texture", { "needsUpdate": true });
    CABLES.ThreeOp.bindFloat(op, material, "displacementScale", 1);
    CABLES.ThreeOp.bindObject(op, material, "emissiveMap", "three texture", { "needsUpdate": true });
    CABLES.ThreeOp.bindObject(op, material, "envMap", "three texture", { "needsUpdate": true });
    CABLES.ThreeOp.bindFloat(op, material, "envMapIntensity", 1);

    CABLES.ThreeOp.bindObject(op, material, "lightMap", "three texture", { "needsUpdate": true });
    CABLES.ThreeOp.bindFloat(op, material, "lightMapIntensity", 1);
    CABLES.ThreeOp.bindObject(op, material, "metalnessMap", "three texture", { "needsUpdate": true });
    CABLES.ThreeOp.bindObject(op, material, "normalMap", "three texture", { "needsUpdate": true });
    CABLES.ThreeOp.bindObject(op, material, "roughnessMap", "three texture", { "needsUpdate": true });
}

function recreate()
{
    material = new THREE.MeshStandardMaterial({});
    bind();
}
