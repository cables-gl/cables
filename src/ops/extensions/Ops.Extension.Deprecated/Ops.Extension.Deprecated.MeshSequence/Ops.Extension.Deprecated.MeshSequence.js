const cgl = this.patch.cgl;

const render = op.inTrigger("render");
const filename = op.inFile("file");

const frame = op.inValueFloat("frame");
frame.set(0);
const trigger = op.outTrigger("trigger");

const calcVertexNormals = this.inValueBool("smooth");
calcVertexNormals.set(true);

const doDraw = op.inValueBool("Render", true);

const outNumFrames = op.outValue("Num Frames");
const outName = op.outValue("Frame Name");

const outGeomA = op.outObject("Geometry A");
const outGeomB = op.outObject("Geometry B");
const geoms = [];
let mesh = null;
window.meshsequencecounter = window.meshsequencecounter || 1;
window.meshsequencecounter++;
const prfx = window.meshsequencecounter + "";
let needsUpdateFrame = false;

const srcHeadVert = ""
    .endl() + "IN vec3 ATTR" + prfx + "_MorphTargetA;"
    .endl() + "IN vec3 ATTR" + prfx + "_MorphTargetB;"
    // .endl()+'IN vec3 attrMorphTargetAN;'
    // .endl()+'IN vec3 attrMorphTargetBN;'
    .endl() + "uniform float MOD_fade;"
    .endl() + "uniform float MOD_doMorph;"
    .endl();

const srcBodyVert = ""
    // .endl()+'   pos =vec4(vPosition,1.0);'
    // .endl() + " if(MOD_doMorph==1.0){"
    .endl() + "   pos = vec4( ATTR" + prfx + "_MorphTargetA * MOD_fade + ATTR" + prfx + "_MorphTargetB * (1.0 - MOD_fade ), 1. );"
    // .endl()+'   pos = vec4( attrMorphTargetA * MOD_fade + vPosition * (1.0 - MOD_fade ), 1. );'
    // .endl()+'   norm = (attrMorphTargetBN * MOD_fade + norm * (1.0 - MOD_fade ) );'
    // .endl()+'   norm = vec3(attrMorphTargetAN * MOD_fade + attrMorphTargetBN * (1.0 - MOD_fade ) );'
    // .endl()+'   norm = attrMorphTargetAN;'
    // .endl() + " }"
    .endl();

let uniFade = null;
let module = null;
let shader = null;
let lastFrame = 0;
let needsReload = false;
function removeModule()
{
    if (shader && module)
    {
        shader.removeModule(module);
        shader = null;
    }
}

function doRender()
{
    if (needsReload)reload();
    if (needsUpdateFrame)updateFrame();
    const fade = frame.get() % 1;
    if (cgl.getShader() && cgl.getShader() != shader)
    {
        if (shader) removeModule();

        shader = cgl.getShader();

        module = shader.addModule(
            {
                "name": "MODULE_VERTEX_POSITION",
                "srcHeadVert": srcHeadVert,
                "srcBodyVert": srcBodyVert
            });

        uniFade = new CGL.Uniform(shader, "f", "MOD_fade", fade);
        uniDoMorph = new CGL.Uniform(shader, "f", "MOD_doMorph", 0);

        // uniFade = new CGL.Uniform(shader, "f", "MOD_fade", fade);
        // uniDoMorph = new CGL.Uniform(shader, "f", "MOD_doMorph", 0);
    }

    if (uniDoMorph)
    {
        uniFade.setValue(fade);
        uniDoMorph.setValue(1.0);
        if (doDraw.get() && mesh !== null) mesh.render(cgl.getShader());
        uniDoMorph.setValue(0);
        trigger.trigger();
    }
}

function updateFrameLater()
{
    needsUpdateFrame = true;
}

function updateFrame()
{
    if (mesh && geoms.length > 0)
    {
        let n = Math.floor(frame.get());
        if (n < 0)n = 0;
        n %= (geoms.length - 1);

        if (n + 1 > geoms.length - 1) n = 0;

        if (n != lastFrame && module && geoms[n + 1])
        {
            if (doDraw.get())
            {
                mesh.updateAttribute("ATTR" + prfx + "_MorphTargetA", geoms[n + 1].verticesTyped);
                mesh.updateAttribute("ATTR" + prfx + "_MorphTargetB", geoms[n].verticesTyped);
            }

            outGeomA.set(geoms[n]);
            outGeomB.set(geoms[n + 1]);
            // mesh.updateAttribute('attrMorphTargetBN',geoms[n].vertexNormals);

            lastFrame = n;
        }
        outName.set(geoms[n].name);
    }
    needsUpdateFrame = false;
}

var uniDoMorph = null;
let loadingId = -1;

function reload()
{
    if (!filename.get() || filename.get() == "") return;

    needsReload = false;

    loadingId = op.patch.loading.start("json mesh sequence", filename.get());

    lastFrame = 0;

    CABLES.ajax(
        op.patch.getFilePath(filename.get()),
        function (err, _data, xhr)
        {
            if (err)
            {
                if (CABLES.UI) op.setUiError("error", "file not found");
                op.log("ajax error:", err);
                op.patch.loading.finished(loadingId);
                return;
            }
            else if (CABLES.UI) op.setUiError("error", null);

            let data = null;

            try
            {
                data = JSON.parse(_data);
            }
            catch (e)
            {
                if (CABLES.UI) op.setUiError("error", "could not load file...");
                op.log("meshsequence could not load file..." + filename.get());
                return;
            }

            geoms.length = 0;

            for (let i = 0; i < data.meshes.length; i++)
            {
                const geom = new CGL.Geometry(op.name);

                geom.verticesIndices = [];
                geom.verticesIndices = [].concat.apply([], data.meshes[0].faces);
                geom.vertices = data.meshes[i].vertices;

                geom.texCoords = data.meshes[0].texturecoords;

                if (calcVertexNormals.get())
                {
                    geom.calculateNormals();
                }
                else
                {
                    geom.unIndex();
                    geom.calculateNormals();
                }

                geom.name = data.meshes[i].name;

                geom.verticesTyped = new Float32Array(geom.vertices);

                geoms.push(geom);
            }

            rebuildMesh();
            outNumFrames.set(geoms.length);
            needsUpdateFrame = true;

            op.uiAttr("info", "num frames: " + data.meshes.length);

            op.patch.loading.finished(loadingId);
            loadingId = -1;
        });
}

function rebuildMesh()
{
    if (geoms.length > 0)
    {
        geoms[0].calculateNormals();

        mesh = new CGL.Mesh(cgl, geoms[0]);
        mesh.addVertexNumbers = true;
        mesh.setGeom(geoms[0]);
        mesh.addAttribute("ATTR" + prfx + "_MorphTargetA", geoms[0].vertices, 3);
        mesh.addAttribute("ATTR" + prfx + "_MorphTargetB", geoms[0].vertices, 3);
    }
}

function reloadLater()
{
    needsReload = true;
}

frame.onChange = updateFrameLater;
filename.onChange = reload;
render.onTriggered = doRender;
calcVertexNormals.onChange = rebuildMesh;
