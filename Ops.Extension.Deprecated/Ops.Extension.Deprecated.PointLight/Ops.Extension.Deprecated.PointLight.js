let exe = op.addInPort(new CABLES.Port(op, "exe", CABLES.OP_PORT_TYPE_FUNCTION));
let trigger = op.outTrigger("trigger");

let attachment = op.addOutPort(new CABLES.Port(op, "attachment", CABLES.OP_PORT_TYPE_FUNCTION));
let attenuation = op.addInPort(new CABLES.Port(op, "attenuation", CABLES.OP_PORT_TYPE_VALUE));

let r = op.addInPort(new CABLES.Port(op, "r", CABLES.OP_PORT_TYPE_VALUE, { "display": "range", "colorPick": "true" }));
let g = op.addInPort(new CABLES.Port(op, "g", CABLES.OP_PORT_TYPE_VALUE, { "display": "range" }));
let b = op.addInPort(new CABLES.Port(op, "b", CABLES.OP_PORT_TYPE_VALUE, { "display": "range" }));

let x = op.addInPort(new CABLES.Port(op, "x", CABLES.OP_PORT_TYPE_VALUE));
let y = op.addInPort(new CABLES.Port(op, "y", CABLES.OP_PORT_TYPE_VALUE));
let z = op.addInPort(new CABLES.Port(op, "z", CABLES.OP_PORT_TYPE_VALUE));

let mul = op.addInPort(new CABLES.Port(op, "multiply", CABLES.OP_PORT_TYPE_VALUE, { "display": "range" }));

let cgl = op.patch.cgl;
mul.set(1);
r.set(1);
g.set(1);
b.set(1);
attenuation.set(0);

r.onChange = updateAll;
g.onChange = updateAll;
b.onChange = updateAll;
x.onChange = updateAll;
y.onChange = updateAll;
z.onChange = updateAll;
attenuation.onChange = updateAttenuation;

let id = CABLES.generateUUID();
let light = {};

let posVec = vec3.create();
let mpos = vec3.create();

updateAll();

function updateColor()
{
    light.color = [r.get(), g.get(), b.get()];
    light.changed = true;
}

function updateAttenuation()
{
    light.attenuation = attenuation.get();
    light.changed = true;
}

function updatePos()
{
}

function updateAll()
{
    if (!cglframeStorephong)cglframeStorephong = {};
    if (!cglframeStorephong.lights)cglframeStorephong.lights = [];
    light = {};
    light.id = id;
    light.type = 0;
    light.changed = true;

    updatePos();
    updateColor();
    updateAttenuation();
}

exe.onTriggered = function ()
{
    cglframeStorephong.lights = cglframeStorephong.lights || [];

    vec3.transformMat4(mpos, [x.get(), y.get(), z.get()], cgl.mvMatrix);
    light = light || {};

    light.pos = mpos;
    light.mul = mul.get();
    light.type = 0;

    if (attachment.isLinked())
    {
        cgl.pushModelMatrix();
        mat4.translate(cgl.mvMatrix, cgl.mvMatrix, [x.get(),
            y.get(),
            z.get()]);
        attachment.trigger();
        cgl.popModelMatrix();
    }

    cglframeStorephong.lights.push(light);
    trigger.trigger();
    cglframeStorephong.lights.pop();
};
