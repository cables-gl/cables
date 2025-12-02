let material = new THREE.MeshPhongMaterial();

const exec = op.inTrigger("Trigger");

bind();

const
    inWire = op.inBool("Wireframe", false),
    inFlat = op.inBool("Flat Shading", false),
    inShiny = op.inFloat("Shininess", 30),
    inMap = op.inObject("Map", null, "three texture"),
    next = op.outTrigger("Next");

inMap.onChange =
inWire.onChange =
inFlat.onChange = recreate;

recreate();

inShiny.onChange = () =>
{
    material.shininess = inShiny.get();
};

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
    CABLES.ThreeOp.bindColor(op, material, "emissive", { "values": 0 });
    CABLES.ThreeOp.bindColor(op, material, "specular", { "values": 1 });
}

function recreate()
{
    const params = { "color": 0xffff00		 };
    if (inMap.get())params.map = inMap.get();
    material = new THREE.MeshPhongMaterial(params);
    material.flatShading = inFlat.get();
    material.wireframe = inWire.get();
    bind();
}
