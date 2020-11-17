op.render = op.inTrigger("render");
op.trigger = op.outTrigger("trigger");

const inSize = op.inValue("Size", 1);
const inOffset = op.inValue("offset");
const inPoints = op.inArray("Points");

const cgl = op.patch.cgl;
let shader = null;
let updateUniformPoints = true;
let pointArray = new Float32Array(99);
const srcHeadVert = attachments.splinedeform_head_vert || "";
const srcBodyVert = attachments.splinedeform_vert || "";

let moduleVert = null;

function removeModule()
{
    if (shader && moduleVert) shader.removeModule(moduleVert);
    shader = null;
}

inPoints.onChange = function ()
{
    if (inPoints.get())
    {
        pointArray = inPoints.get();
        updateUniformPoints = true;
    }
};

op.render.onLinkChanged = removeModule;
let ready = false;
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

        moduleVert = shader.addModule(
            {
                "title": op.objName,
                "name": "MODULE_VERTEX_POSITION",
                "srcHeadVert": srcHeadVert,
                "srcBodyVert": srcBodyVert
            });

        inSize.uniform = new CGL.Uniform(shader, "f", moduleVert.prefix + "size", inSize);
        inOffset.offset = new CGL.Uniform(shader, "f", moduleVert.prefix + "offset", inOffset);

        op.uniPoints = new CGL.Uniform(shader, "3f[]", moduleVert.prefix + "points", new Float32Array([0, 0, 0, 0, 0, 0]));
        ready = false;
        updateUniformPoints = true;
    }

    if (shader && updateUniformPoints && pointArray && pointArray.length >= 3)
    {
        if (shader.getDefine("SPLINE_POINTS") != Math.floor(pointArray.length / 3))
        {
            shader.define("SPLINE_POINTS", Math.floor(pointArray.length / 3));
        }

        op.uniPoints.setValue(pointArray);
        updateUniformPoints = false;
        ready = true;
    }

    if (!shader || !ready) return;

    op.trigger.trigger();
};
