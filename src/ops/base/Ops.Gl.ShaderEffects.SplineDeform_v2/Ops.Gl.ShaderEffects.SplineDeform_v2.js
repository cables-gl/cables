const
    render = op.inTrigger("Render"),
    next = op.outTrigger("Next"),
    inSize = op.inValue("Size", 1),
    inOffset = op.inValue("offset"),
    inPoints = op.inArray("Points");

const cgl = op.patch.cgl;
const srcHeadVert = attachments.splinedeform_head_vert || "";
const srcBodyVert = attachments.splinedeform_vert || "";

let needsUpdate = true;

const mod = new CGL.ShaderModifier(cgl, op.name, { "opId": op.id });
mod.addModule({
    "title": op.name,
    "name": "MODULE_VERTEX_POSITION",
    srcHeadVert,
    srcBodyVert
});

mod.addUniform("f", "MOD_size", inSize);
mod.addUniform("f", "MOD_offset", inOffset);
mod.addUniform("3f[]", "MOD_points", new Float32Array([0, 0, 0, 0, 0, 0]));
mod.define("SPLINE_POINTS", 1);

inPoints.onChange = () =>
{
    needsUpdate = true;
};

render.onTriggered = function ()
{
    mod.bind();
    let pointArray = inPoints.get();

    if (needsUpdate)
    {
        if (inPoints.get())
        {
            if (pointArray && pointArray.length > 0)
            {
                mod.define("SPLINE_POINTS", Math.floor(pointArray.length / 3));
                needsUpdate = false;
            }
        }
    }

    if (pointArray && pointArray.length > 0)
        mod.setUniformValue("MOD_points", pointArray);

    next.trigger();
    mod.unbind();
};
