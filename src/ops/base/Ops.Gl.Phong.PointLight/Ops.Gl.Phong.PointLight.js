

const exe = op.inTrigger("exe"),
    trigger = op.outTrigger("trigger"),
    attachment = op.outTrigger("attachment"),
    radius = op.inValue("Radius", 100),
    fallOff = op.inValueSlider("Fall Off", 0.1),
    intensity = op.inValue("Intensity", 1),
    x = op.inValueFloat("x"),
    y = op.inValueFloat("y"),
    z = op.inValueFloat("z");

const r = op.inValueSlider("r", Math.random()),
    g = op.inValueSlider("g", Math.random()),
    b = op.inValueSlider("b", Math.random());
r.setUiAttribs({ "colorPick": true });

const ambientR = op.inValue("Ambient R", 0.1),
    ambientG = op.inValue("Ambient G", 0.1),
    ambientB = op.inValue("Ambient B", 0.1);

const specularR = op.inValueSlider("Specular r", Math.random()),
    specularG = op.inValueSlider("Specular g", Math.random()),
    specularB = op.inValueSlider("Specular b", Math.random());
specularR.setUiAttribs({ "colorPick": true });

let cgl = op.patch.cgl;

radius.onChange = updateAll;
fallOff.onChange = updateAll;
intensity.onChange = updateAll;
r.onChange = updateAll;
g.onChange = updateAll;
b.onChange = updateAll;
x.onChange = updateAll;
y.onChange = updateAll;
z.onChange = updateAll;

ambientR.onChange = updateAll;
ambientG.onChange = updateAll;
ambientB.onChange = updateAll;
specularR.onChange = updateAll;
specularG.onChange = updateAll;
specularB.onChange = updateAll;

let id = CABLES.generateUUID();
let light = {};

let posVec = vec3.create();
let mpos = vec3.create();
let needsUpdate = true;

updateAll();

function updateColor()
{
    light.color = light.color || [];
    light.color[0] = r.get();
    light.color[1] = g.get();
    light.color[2] = b.get();

    light.ambient = light.ambient || [];
    light.ambient[0] = ambientR.get();
    light.ambient[1] = ambientG.get();
    light.ambient[2] = ambientB.get();

    light.specular = light.specular || [];
    light.specular[0] = specularR.get();
    light.specular[1] = specularG.get();
    light.specular[2] = specularB.get();

    light.changed = true;
}

function updateAll()
{
    needsUpdate = true;
}

let transVec = vec3.create();

exe.onTriggered = function ()
{
    if (needsUpdate)
    {
        if (!cgl.tempData.phong)cgl.tempData.phong = {};
        if (!cgl.tempData.phong.lights)cgl.tempData.phong.lights = [];
        light = light || {};
        light.id = id;
        light.type = 0;
        light.changed = true;
        light.radius = radius.get();
        light.fallOff = fallOff.get();
        light.mul = intensity.get();

        updateColor();
        needsUpdate = false;
    }

    cgl.tempData.phong.lights = cgl.tempData.phong.lights || [];

    vec3.set(transVec, x.get(), y.get(), z.get());
    vec3.transformMat4(mpos, transVec, cgl.mMatrix);
    light = light || {};

    light.pos = mpos;
    light.type = 0;


    if (cgl.shouldDrawHelpers(op))
    {
        cgl.pushModelMatrix();
        mat4.translate(cgl.mMatrix, cgl.mMatrix, transVec);
        CABLES.GL_MARKER.drawSphere(op, radius.get() * 2);
        cgl.popModelMatrix();
    }

    if (attachment.isLinked())
    {
        cgl.pushModelMatrix();
        mat4.translate(cgl.mMatrix, cgl.mMatrix, transVec);
        attachment.trigger();
        cgl.popModelMatrix();
    }

    cgl.tempData.phong.lights.push(light);
    trigger.trigger();
    cgl.tempData.phong.lights.pop();

    if (op.isCurrentUiOp())
        gui.setTransformGizmo(
            {
                "posX": x,
                "posY": y,
                "posZ": z
            });
};

