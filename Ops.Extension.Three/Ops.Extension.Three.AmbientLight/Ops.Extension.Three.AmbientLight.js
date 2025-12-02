const
    exec = op.inTrigger("Trigger"),
    inIntens = op.inFloat("Intensity", 1),
    r = op.inValueSlider("r", 0.1),
    g = op.inValueSlider("g", 0.1),
    b = op.inValueSlider("b", 0.1),
    next = op.outTrigger("Next");

r.setUiAttribs({ "colorPick": true });

const threeOp = new CABLES.ThreeOp(op);

const container = new THREE.Object3D();

let light = null;

inIntens.onChange =
r.onChange =
g.onChange =
b.onChange = updateColor;

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
        light = new THREE.AmbientLight(0xffffff, 4);

        container.add(light);

        updateColor();

        threeOp.setSceneObject(container);
    }

    threeOp.push();

    next.trigger();
    threeOp.pop();
};
