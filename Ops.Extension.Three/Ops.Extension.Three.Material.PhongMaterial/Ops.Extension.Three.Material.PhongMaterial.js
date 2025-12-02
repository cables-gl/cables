const
    exec = op.inTrigger("Trigger"),
    inR = op.inFloatSlider("Color R", 0),
    inG = op.inFloatSlider("Color G", 0),
    inB = op.inFloatSlider("Color B", 0),
    next = op.outTrigger("Next");

const material = new THREE.MeshPhongMaterial({ "color": 0xffff00		 });

inR.onChange =
inG.onChange =
inB.onChange = () =>
{
    material.color.set(inR.get(), inG.get(), inB.get());
};

exec.onTriggered = () =>
{
    op.patch.cg.frameStore.three.renderer.pushMaterial(material);
    next.trigger();
    op.patch.cg.frameStore.three.renderer.popMaterial();
};
