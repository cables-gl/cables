let render = op.inTrigger("Render");
let next = op.outTrigger("Next");

let inGeomA = op.inObject("Geometry 1");
let inGeomB = op.inObject("Geometry 2");

let inFade = op.inValueSlider("Fade");

let inStart = op.inValueSlider("Start");
let inEnd = op.inValueSlider("End");

let cgl = op.patch.cgl;
let shader = null;
let mesh = null;
let module = null;
let needsRebuild = true;
let uniFade = null;
inGeomA.onChange = rebuildLater;
inGeomB.onChange = rebuildLater;

let srcHeadVert = ""
    .endl() + "IN vec3 MOD_morphTarget;"
    // .endl()+'UNI float MOD_fade;'
    .endl() + "UNI float MOD_vert_start;"
    .endl() + "UNI float MOD_vert_end;"
    .endl();

let srcBodyVert = attachments.morph_faces_vert;

function removeModule()
{
    if (shader && module)
    {
        shader.removeModule(module);
        shader = null;
    }
}

render.onLinkChanged = removeModule;

render.onTriggered = function ()
{
    if (cgl.getShader() != shader)
    {
        if (shader) removeModule();

        shader = cgl.getShader();

        module = shader.addModule(
            {
                "priority": -11,
                "title": op.objName,

                "name": "MODULE_VERTEX_POSITION",
                "srcHeadVert": srcHeadVert,
                "srcBodyVert": srcBodyVert
            });

        op.log("morph module inited");

        uniFade = new CGL.Uniform(shader, "f", module.prefix + "fade", inFade);

        inStart.uni = new CGL.Uniform(shader, "f", module.prefix + "vert_start", 0);
        inEnd.uni = new CGL.Uniform(shader, "f", module.prefix + "vert_end", 2000);

        updateStart();
        updateEnd();

        needsRebuild = true;
    }

    if (needsRebuild)rebuild();
    if (!mesh) return;

    mesh.render(cgl.getShader());

    next.trigger();
};

inStart.onChange = updateStart;
inEnd.onChange = updateEnd;

function updateStart()
{
    if (inStart.uni && inGeomA.get())
        inStart.uni.setValue(inStart.get() * inGeomA.get().vertices.length / 3);
}

function updateEnd()
{
    if (inEnd.uni && inGeomA.get())
        inEnd.uni.setValue(inEnd.get() * inGeomA.get().vertices.length / 3);
}

function doRender()
{
    next.trigger();
}

function rebuildLater()
{
    needsRebuild = true;
}

function rebuild()
{
    if (inGeomB.get() && inGeomA.get() && module)
    {
        let geom = inGeomA.get();

        mesh = new CGL.Mesh(cgl, geom);
        mesh.addVertexNumbers = true;
        mesh.addAttribute(module.prefix + "morphTarget", inGeomB.get().vertices, 3);

        needsRebuild = false;
    }
    else
    {
        mesh = null;
    }
}
