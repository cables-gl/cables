const
    exec = op.inTrigger("Trigger"),
    inR = op.inFloatSlider("Color R", 0),
    inG = op.inFloatSlider("Color G", 0),
    inB = op.inFloatSlider("Color B", 0),

    inWire = op.inBool("Wireframe", false),
    inFlat = op.inBool("Flat Shading", false),
    inShiny = op.inFloat("Shininess", 30),

    inEmissiveR = op.inFloatSlider("Emissive R", 0),
    inEmissiveG = op.inFloatSlider("Emissive G", 0),
    inEmissiveB = op.inFloatSlider("Emissive B", 0),

    inSpecularR = op.inFloatSlider("Specular R", 0),
    inSpecularG = op.inFloatSlider("Specular G", 0),
    inSpecularB = op.inFloatSlider("Specular B", 0),

    next = op.outTrigger("Next");

inR.setUiAttribs({ "colorPick": true });

const material = new THREE.MeshPhongMaterial({ "color": 0xffff00		 });

inR.onChange =
inG.onChange =
inB.onChange = () =>
{
    material.color.set(inR.get(), inG.get(), inB.get());
};

inEmissiveR.onChange =
inEmissiveG.onChange =
inEmissiveB.onChange = () =>
{
    material.emissive.set(inEmissiveR.get(), inEmissiveG.get(), inEmissiveB.get());
};

inSpecularR.onChange =
inSpecularG.onChange =
inSpecularB.onChange = () =>
{
    material.specular.set(inSpecularR.get(), inSpecularG.get(), inSpecularB.get());
};

inFlat.onChange = () =>
{
    material.flatShading = inFlat.get();
};
inWire.onChange = () =>
{
    material.wireframe = inWire.get();
};

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
