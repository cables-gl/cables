op.render = op.inTrigger("render");
op.trigger = op.outTrigger("trigger");

const axis = op.inValueSelect("Axis", ["X", "Y", "XY", "X Inverted", "Y Inverted", "XY Inverted"], "X");
const inTreshhold = op.inValueSlider("treshhold", 0.3);

const inSinAnim = op.inValueBool("Sine Animation", false);
const inTime = op.inValueFloat("Time");
const inSinAxis = op.inValueSelect("Sine Source", ["Texcoord X", "Texcoord Y"], "Texcoord X");

const inFreq = op.inValueFloat("Frequency", 10);
const inAmpl = op.inValueFloat("Amplitude", 10);

op.setPortGroup("Sine Animation", [inTime, inSinAnim, inFreq, inAmpl, inSinAxis]);

const cgl = op.patch.cgl;
let shader = null;

let srcHeadFrag = ""
    .endl() + "UNI float MOD_treshhold;"
    .endl() + "UNI float MOD_time;"
    .endl() + "UNI float MOD_ampl;"
    .endl() + "UNI float MOD_freq;"
    .endl();

let moduleFrag = null;

inSinAxis.onChange = inSinAnim.onChange = axis.onChange = updateAxis;

function updateAxis()
{
    if (!shader) return;
    shader.toggleDefine(moduleFrag.prefix + "AXIS_X", axis.get() == "X");
    shader.toggleDefine(moduleFrag.prefix + "AXIS_Y", axis.get() == "Y");
    shader.toggleDefine(moduleFrag.prefix + "AXIS_XY", axis.get() == "XY");
    shader.toggleDefine(moduleFrag.prefix + "AXIS_X_INV", axis.get() == "X Inverted");
    shader.toggleDefine(moduleFrag.prefix + "AXIS_Y_INV", axis.get() == "Y Inverted");
    shader.toggleDefine(moduleFrag.prefix + "AXIS_XY_INV", axis.get() == "XY Inverted");

    shader.toggleDefine(moduleFrag.prefix + "ANIN_SIN", inSinAnim.get());

    shader.toggleDefine(moduleFrag.prefix + "ANIN_SIN_TCX", inSinAxis.get() == "Texcoord X");
    shader.toggleDefine(moduleFrag.prefix + "ANIN_SIN_TCY", inSinAxis.get() == "Texcoord Y");
}

function removeModule()
{
    if (shader && moduleFrag) shader.removeModule(moduleFrag);
    shader = null;
}

op.render.onLinkChanged = removeModule;
let
    uniTime = null,
    uniFreq = null,
    uniAmpl = null,
    uniTreshhold = null;

op.render.onTriggered = function ()
{
    if (!cgl.getShader())
    {
        op.trigger.trigger();
        return;
    }

    if (cgl.getShader() != shader)
    {
        if (shader) removeModule();
        shader = cgl.getShader();

        moduleFrag = shader.addModule(
            {
                "title": op.objName,
                "name": "MODULE_COLOR",
                "srcHeadFrag": srcHeadFrag,
                "srcBodyFrag": attachments.limitByTexCoords_frag || ""
            });

        uniTreshhold = new CGL.Uniform(shader, "f", moduleFrag.prefix + "treshhold", inTreshhold);
        uniTime = new CGL.Uniform(shader, "f", moduleFrag.prefix + "time", inTime);
        uniFreq = new CGL.Uniform(shader, "f", moduleFrag.prefix + "freq", inFreq);
        uniAmpl = new CGL.Uniform(shader, "f", moduleFrag.prefix + "ampl", inAmpl);

        updateAxis();
    }

    if (!shader) return;

    op.trigger.trigger();
};
