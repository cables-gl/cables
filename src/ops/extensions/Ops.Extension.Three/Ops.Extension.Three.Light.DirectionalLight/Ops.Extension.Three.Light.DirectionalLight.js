const
    exec = op.inTrigger("Trigger"),

    inIntens = op.inFloat("Intensity", 1),
    inPosX = op.inFloat("Position X"),
    inPosY = op.inFloat("Position Y"),
    inPosZ = op.inFloat("Position Z"),
    r = op.inValueSlider("r", 1),
    g = op.inValueSlider("g", 1),
    b = op.inValueSlider("b", 1),
    inCastShadow = op.inBool("Cast Shadow", false),
    next = op.outTrigger("Next");

r.setUiAttribs({ "colorPick": true });

const threeOp = new CABLES.ThreeOp(op);

const container = new THREE.Object3D();

let light = null;

inPosX.onChange =
inPosY.onChange =
inPosZ.onChange = updatePos;

inIntens.onChange =
r.onChange =
g.onChange =
b.onChange = updateColor;

function updatePos()
{
    if (light)
        light.position.set(inPosX.get(), inPosY.get(), inPosZ.get());
}

function updateColor()
{
    if (!light) return;
    light.color.set(r.get(), g.get(), b.get());
    light.intensity = inIntens.get();
}

exec.onTriggered = () =>
{
    if (!light)
    {
        light = new THREE.DirectionalLight(0xffffff, 4);
        light.position.set(inPosX.get(), inPosY.get(), inPosZ.get());

        light.castShadow = true;
        light.shadow.camera.top = 5;
        light.shadow.camera.bottom = -5;
        light.shadow.camera.left = -5;
        light.shadow.camera.right = 5;
        light.shadow.camera.near = 0.1;
        light.shadow.camera.far = 35;
        light.shadow.bias = 0.0001;

        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
        // light.shadow.radius=0.2;
        // light.shadow.blurSamples=2;
        // light = new THREE.PointLight(0xffffff, 1, 100);
        // light.position.set(0, 0, 0);
        container.add(light);

        updateColor();

        threeOp.setSceneObject(container);
    }
    light.castShadow = inCastShadow.get();

    threeOp.push();

    next.trigger();
    threeOp.pop();
};
