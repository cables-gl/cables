const
    render = op.inTrigger("Render"),
    next = op.outTrigger("Next"),

    inSize = op.inValue("Size", 1),
    inOffset = op.inValue("offset"),
    inPoints = op.inArray("Points");

const cgl = op.patch.cgl;
const srcHeadVert = attachments.splinedeform_head_vert || "";
const srcBodyVert = attachments.splinedeform_vert || "";

let needsUpdate=true;

const mod = new CGL.ShaderModifier(cgl, op.name);
mod.addModule({
    "title": op.name,
    "name": "MODULE_VERTEX_POSITION",
    srcHeadVert,
    srcBodyVert
});

mod.addUniform("f", "MOD_size", inSize);
mod.addUniform("f", "MOD_offset", inOffset);
const uniPoints=mod.addUniform("3f[]", "MOD_points", new Float32Array([0, 0, 0, 0, 0, 0]));
mod.define("SPLINE_POINTS",1);

inPoints.onChange = ()=>
{
    needsUpdate=true;
};

render.onTriggered = function ()
{
    mod.bind();

    if(needsUpdate)
    {
        if (inPoints.get())
        {
            let pointArray = inPoints.get();
            mod.define("SPLINE_POINTS",Math.floor(pointArray.length / 3));
            mod.setUniformValue("MOD_points",pointArray);
           needsUpdate=false;
        }
    }

    next.trigger();
    mod.unbind();
};
