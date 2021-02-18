op.render = op.inTrigger("render");
op.trigger = op.outTrigger("trigger");
let inStrength = op.inValue("Strength", 1);

let scrollx = op.inValue("Scroll X");
let scrolly = op.inValue("Scroll Y");
let scrollz = op.inValue("Scroll Z");

let cgl = op.patch.cgl;

let shader = null;

let inWorldSpace = op.inValueBool("WorldSpace");

let srcHeadVert = attachments.perlin_instposition_vert || "";

let srcBodyVert = ""
    .endl() + "#ifdef INSTANCING"
    .endl() + "   pos=MOD_deform(instMat,pos);"
    .endl() + "#endif"

    .endl();

let moduleVert = null;

function removeModule()
{
    if (shader && moduleVert) shader.removeModule(moduleVert);
    shader = null;
}

op.render.onLinkChanged = removeModule;

inWorldSpace.onChange = updateWorldspace;

function updateWorldspace()
{
    if (!shader) return;
    if (inWorldSpace.get()) shader.define(moduleVert.prefix + "WORLDSPACE");
    else shader.removeDefine(moduleVert.prefix + "WORLDSPACE");
}

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

        // inSize.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'size',inSize);
        inStrength.uniform = new CGL.Uniform(shader, "f", moduleVert.prefix + "strength", inStrength);
        // inSmooth.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'smooth',inSmooth);
        // inScale.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'scale',inScale);

        scrollx.uniform = new CGL.Uniform(shader, "f", moduleVert.prefix + "scrollx", scrollx);
        scrolly.uniform = new CGL.Uniform(shader, "f", moduleVert.prefix + "scrolly", scrolly);
        scrollz.uniform = new CGL.Uniform(shader, "f", moduleVert.prefix + "scrollz", scrollz);

        // x.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'x',x);
        // y.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'y',y);
        // z.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'z',z);

        updateWorldspace();
    }

    if (!shader) return;

    op.trigger.trigger();
};
