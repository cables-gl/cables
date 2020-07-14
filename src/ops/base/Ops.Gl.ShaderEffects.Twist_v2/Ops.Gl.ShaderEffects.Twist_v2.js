
let render = op.inTrigger("render");
let trigger = op.outTrigger("Trigger");
let amount = op.inValue("Degree", 180);
let height = op.inValue("Height", 2);

let axis = op.inValueSelect("Axis", ["X", "Y", "Z"], "Y");


let uniAmount = null;
let uniHeight = null;
let cgl = op.patch.cgl;
let shader = null;
let mod = null;

function removeModule()
{
    if (shader && mod)
    {
        shader.removeModule(mod);
        shader = null;
    }
}

axis.onChange = updateAxis;

function updateAxis()
{
    if (!shader) return;
    shader.removeDefine(mod.prefix + "AXIS_X");
    shader.removeDefine(mod.prefix + "AXIS_Y");
    shader.removeDefine(mod.prefix + "AXIS_Z");

    if (axis.get() == "X")shader.define(mod.prefix + "AXIS_X");
    if (axis.get() == "Y")shader.define(mod.prefix + "AXIS_Y");
    if (axis.get() == "Z")shader.define(mod.prefix + "AXIS_Z");
}

render.onLinkChanged = removeModule;
render.onTriggered = function ()
{
    if (cgl.getShader() != shader)
    {
        if (shader) removeModule();
        shader = cgl.getShader();
        mod = shader.addModule(
            {
                "name": "MODULE_VERTEX_POSITION",
                "srcHeadVert": attachments.twist_head_vert,
                "srcBodyVert": attachments.twist_vert
            });

        uniAmount = new CGL.Uniform(shader, "f", mod.prefix + "amount", amount);
        uniHeight = new CGL.Uniform(shader, "f", mod.prefix + "height", height);
        updateAxis();
    }

    if (!shader) return;

    if (cgl.shouldDrawHelpers(op))
    {
        CABLES.GL_MARKER.drawCube(op, 1, height.get() / 2, 1);
    }

    trigger.trigger();
};
