op.name = "Points";

let render = op.inTrigger("render");
let pointSize = op.addInPort(new CABLES.Port(op, "pointSize"));

let trigger = op.outTrigger("trigger");

pointSize.set(2);

let shader = null;
let mod = null;
let uniPointSize = null;

let cgl = op.patch.cgl;

pointSize.onChange = setPointSize;

function setPointSize()
{
    if (uniPointSize) uniPointSize.setValue(pointSize.get());
}

render.onTriggered = function ()
{
    let oldPrim = 0;
    if (cgl.getShader() != shader)
    {
        if (shader && mod)
        {
            shader.removeModule(mod);
            shader = null;
        }

        shader = cgl.getShader();

        let srcHeadVert = ""
            .endl() + "uniform float {{mod}}_size;"
            .endl();

        mod = shader.addModule(
            {
                "name": "MODULE_VERTEX_POSITION",
                "srcHeadVert": srcHeadVert,
                "srcBodyVert": "gl_PointSize = {{mod}}_size;"
            });

        uniPointSize = new CGL.Uniform(shader, "f", mod.prefix + "_size", pointSize.get());
    }

    shader = cgl.getShader();
    oldPrim = shader.glPrimitive;
    shader.glPrimitive = cgl.gl.POINTS;

    trigger.trigger();

    shader.glPrimitive = oldPrim;
};

function updateResolution()
{
}

op.onResize = updateResolution;

pointSize.set(2);
