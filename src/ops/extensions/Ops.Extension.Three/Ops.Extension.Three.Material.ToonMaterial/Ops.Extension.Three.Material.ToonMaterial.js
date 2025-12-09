const
    exec = op.inTrigger("Trigger"),
    inR = op.inFloatSlider("Color R", Math.random()),
    inG = op.inFloatSlider("Color G", Math.random()),
    inB = op.inFloatSlider("Color B", Math.random()),
    inA = op.inFloatSlider("Color A", 1),
    inWire = op.inBool("Wireframe", false),
    inMap = op.inObject("Map", null, "three texture"),
    next = op.outTrigger("Next");

inR.setUiAttribs({ "colorPick": true });

let material = new THREE.MeshPhongMaterial({ "color": 0xffffff });

inR.onChange =
inG.onChange =
inB.onChange = setColor;

inMap.onChange =
inWire.onChange = recreate;

recreate();

exec.onTriggered = () =>
{
    if (!op.patch.cg.frameStore.three) return;
    if (!op.patch.cg.frameStore.three.renderer) return;
    op.patch.cg.frameStore.three.renderer.pushMaterial(material);
    next.trigger();
    op.patch.cg.frameStore.three.renderer.popMaterial();
};

function recreate()
{
    const params = { "color": 0xffff00		 };
    if (inMap.get())params.map = inMap.get();
    material = new THREE.MeshToonMaterial(params);
    material.wireframe = inWire.get();
    setColor();
}

function setColor()
{
    material.color.set(inR.get(), inG.get(), inB.get());
}
