const
    exec = op.inTrigger("Trigger"),
    inR = op.inFloatSlider("Color R", Math.random()),
    inG = op.inFloatSlider("Color G", Math.random()),
    inB = op.inFloatSlider("Color B", Math.random()),
    inA = op.inFloatSlider("Color A", 1),
    inWire = op.inBool("Wireframe", false),
    inFlat = op.inBool("Flat Shading", false),
    inShiny = op.inFloat("Shininess", 30),
    inMap = op.inObject("Map", null, "three texture"),
    inEmissiveR = op.inFloatSlider("Emissive R", 0),
    inEmissiveG = op.inFloatSlider("Emissive G", 0),
    inEmissiveB = op.inFloatSlider("Emissive B", 0),
    inSpecularR = op.inFloatSlider("Specular R", 1),
    inSpecularG = op.inFloatSlider("Specular G", 1),
    inSpecularB = op.inFloatSlider("Specular B", 1),

    next = op.outTrigger("Next");

inR.setUiAttribs({ "colorPick": true });

let material = new THREE.MeshPhongMaterial({ "color": 0xffff00		 });

inR.onChange =
inG.onChange =
inB.onChange = setColor;

inEmissiveR.onChange =
inEmissiveG.onChange =
inEmissiveB.onChange = setEmissiveColor;

inSpecularR.onChange =
inSpecularG.onChange =
inSpecularB.onChange = setSpecularColor;

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

function recreate()
{
    const params = { "color": 0xffff00		 };
    console.log("recreate...");
    if (inMap.get())params.map = inMap.get();
    material = new THREE.MeshPhongMaterial(params);
    material.flatShading = inFlat.get();
    material.wireframe = inWire.get();
    setColor();
    setEmissiveColor();
    setSpecularColor();
}

function setColor()
{
    material.color.set(inR.get(), inG.get(), inB.get());
}

function setEmissiveColor()
{
    material.emissive.set(inEmissiveR.get(), inEmissiveG.get(), inEmissiveB.get());
}

function setSpecularColor()
{
    material.specular.set(inSpecularR.get(), inSpecularG.get(), inSpecularB.get());
}
