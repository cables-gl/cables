// https://www.khronos.org/opengl/wiki/Skeletal_Animation

const render = op.inTrigger("Render");
const inMeshIndex = op.inValueInt("MeshIndex");
const inGeom = op.inObject("Geometry");
const draw = op.inValueBool("draw", true);
const next = op.outTrigger("Next");

let geom = null;
let mesh = null;
let shader = null;

const cgl = op.patch.cgl;
let meshIndex = 0;

const boneMatrices = [];
let boneMatricesUniform = null;
let vertWeights = null;
let vertIndex = null;
let attribWeightsScene = -1;
let moduleVert = null;

render.onLinkChanged = removeModule;
op.onDelete = removeModule;
inMeshIndex.onChange = reset;
inGeom.onChange = setGeom;

function removeModule()
{
    if (shader && moduleVert) shader.removeModule(moduleVert);
    shader = null;
    reset();
}

function reset()
{
    meshIndex = inMeshIndex.get();
    attribWeightsScene = null;
    if (shader)removeModule();
    mesh = null;
    vertWeights = null;
}

function setGeom()
{
    vertWeights = null;
    geom = inGeom.get();

    if (geom)
    {
        mesh = new CGL.Mesh(cgl, geom);
        op.setUiError("geom", null);
    }
    else
    {
        op.setUiError("geom", "no/invalid geometry");
    }
}

function setupIndexWeights(jsonMesh)
{
    if (!mesh)
    {
        return;
    }

    if (!vertWeights || vertWeights.length != geom.vertices.length / 3)
    {
        vertWeights = [];
        vertIndex = [];
        vertWeights.length = geom.vertices.length / 3;
        vertIndex.length = geom.vertices.length / 3;

        for (var i = 0; i < vertWeights.length; i++)
        {
            vertWeights[i] = [-1, -1, -1, -1];
            vertIndex[i] = [-1, -1, -1, -1];
        }
    }

    let maxBone = -1;
    let maxindex = -1;
    const bones = jsonMesh.bones;
    for (var i = 0; i < bones.length; i++)
    {
        const bone = bones[i];
        maxBone = Math.max(maxBone, i);

        for (let w = 0; w < bone.weights.length; w++)
        {
            const index = bone.weights[w][0];
            const weight = bone.weights[w][1];
            maxindex = Math.max(maxindex, index);

            if (vertWeights[index].length)
                if (vertWeights[index][0] == -1)
                {
                    vertWeights[index][0] = weight;
                    vertIndex[index][0] = i;
                }
                else if (vertWeights[index][1] == -1)
                {
                    vertWeights[index][1] = weight;
                    vertIndex[index][1] = i;
                }
                else if (vertWeights[index][2] == -1)
                {
                    vertWeights[index][2] = weight;
                    vertIndex[index][2] = i;
                }
                else if (vertWeights[index][3] == -1)
                {
                    vertWeights[index][3] = weight;
                    vertIndex[index][3] = i;
                }
                else op.warn("too many weights for vertex!");
        }
    }

    shader.define("SKIN_NUM_BONES", bones.length);

    const vi = [].concat.apply([], vertIndex);
    const vw = [].concat.apply([], vertWeights);

    mesh.setAttribute("skinIndex", vi, 4);
    mesh.setAttribute("skinWeight", vw, 4);
}

render.onTriggered = function ()
{
    if (!cgl.getShader()) return;
    const scene = cgl.frameStore.currentScene.getValue();

    if ((mesh && scene && scene.meshes && scene.meshes.length > meshIndex) || cgl.getShader() != shader)
    {
        if (cgl.getShader() != shader)
        {
            var startInit = CABLES.now();

            if (shader)removeModule();
            shader = cgl.getShader();

            moduleVert = shader.addModule(
                {
                    "title": op.objName,
                    "priority": -1,
                    "name": "MODULE_VERTEX_POSITION",
                    "srcHeadVert": attachments.skin_head_vert || "",
                    "srcBodyVert": attachments.skin_vert || ""
                });
            shader.define("SKIN_NUM_BONES", 1);
            boneMatricesUniform = new CGL.Uniform(shader, "m4", "bone", []);
            attribWeightsScene = null;
        }

        if (attribWeightsScene != scene)
        {
            var startInit = CABLES.now();
            vertWeights = null;
            setGeom();
            attribWeightsScene = scene;
            setupIndexWeights(scene.meshes[meshIndex]);
        }

        const bones = scene.meshes[meshIndex].bones;

        for (let i = 0; i < bones.length; i++)
        {
            if (bones[i].matrix)
            {
                if (boneMatrices.length != bones.length * 16)
                    boneMatrices.length = bones.length * 16;

                for (let mi = 0; mi < 16; mi++)
                    boneMatrices[i * 16 + mi] = bones[i].matrix[mi];
            }
            else
            {
                op.warn("no bone matrix", i);
            }
        }

        boneMatricesUniform.setValue(boneMatrices);
    }

    if (draw.get() && mesh)
    {
        if (mesh) mesh.render(cgl.getShader());
        next.trigger();
    }
};
