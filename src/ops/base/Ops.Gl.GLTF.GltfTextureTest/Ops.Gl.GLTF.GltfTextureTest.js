const render = op.inTrigger("render");

const diffuseTexture = op.inTexture("texture");
const whichTex = op.inSwitch("Show tex", ["Albedo", "Normal", "AO", "MR", "Lightmap"], "Albedo");
const trigger = op.outTrigger("trigger");
const shaderOut = op.outObject("shader", null, "shader");

op.toWorkPortsNeedToBeLinked(render, diffuseTexture);
op.toWorkShouldNotBeChild("Ops.Gl.TextureEffects.ImageCompose", CABLES.OP_PORT_TYPE_FUNCTION);

const cgl = op.patch.cgl;

const shader = new CGL.Shader(cgl, "basicmaterial", this);
shader.addAttribute({ "type": "vec3", "name": "vPosition" });
shader.addAttribute({ "type": "vec2", "name": "attrTexCoord" });
shader.addAttribute({ "type": "vec3", "name": "attrVertNormal", "nameFrag": "norm" });
shader.addAttribute({ "type": "float", "name": "attrVertIndex" });

shader.setModules(["MODULE_VERTEX_POSITION", "MODULE_COLOR", "MODULE_BEGIN_FRAG", "MODULE_VERTEX_MODELVIEW"]);

shader.setSource(attachments.vert_vert, attachments.frag_frag);

shader.define("HAS_TEXTURE_DIFFUSE");
shader.define("HAS_TEXTURES");

shaderOut.setRef(shader);

render.onTriggered = doRender;

diffuseTexture.onChange = updateDiffuseTexture;

let diffuseTextureUniform = new CGL.Uniform(shader, "t", "texDiffuse");

const texTransUni = shader.addUniformFrag("4f", "texTransform", 1, 1, 0, 0);

shader.materialPropUniforms = {
    "texTransform": texTransUni,
};

updateDiffuseTexture();

op.preRender = function ()
{
    shader.bind();
    doRender();
    if (!shader) return;
};

function doRender()
{
    op.checkGraphicsApi();
    shader.popTextures();

    cgl.pushShader(shader);
    if (!diffuseTextureUniform)
    {
        diffuseTextureUniform = new CGL.Uniform(shader, "t", "texDiffuse");
        console.log("no texuniiiiiiiiiiiiii");
    }

    if (diffuseTextureUniform && diffuseTexture.get())
    {
        shader.pushTexture(diffuseTextureUniform, diffuseTexture.get().tex);
    }

    shader.materialPropUniforms = {
        "texTransform": texTransUni,
    };

    shader.toggleDefine("CHAN1", whichTex.get() == "Lightmap");
    if (whichTex.get() == "Albedo")shader.materialPropUniforms.diffuseTexture = diffuseTextureUniform;
    else if (whichTex.get() == "Normal") shader.materialPropUniforms.normalTexture = diffuseTextureUniform;
    else if (whichTex.get() == "AO")shader.materialPropUniforms.occlusionTexture = diffuseTextureUniform;
    else if (whichTex.get() == "MR")shader.materialPropUniforms.metalRoughnessTexture = diffuseTextureUniform;
    else if (whichTex.get() == "Lightmap")shader.materialPropUniforms.lightmapTexture = diffuseTextureUniform;
    else console.log("value wrong");

    // "normalTexture": diffuseTextureUniform,
    // "metalRoughnessTexture": inRMUniform,
    // "occlusionTexture": inAOUniform,
    // "diffuseColor": inDiffuseColor,
    // "pbrMetalness": inMetalnessUniform,
    // "pbrMetalness": inMetalnessUniform,
    // "pbrRoughness": inRoughnessUniform,
    // "lightmapTexture": inLightmapUniform,
    // "unlit": inUnlitUniform,
    // "texTransform": uniTexTrans

    // shader.materialPropUniforms.diffuseTexture = diffuseTextureUniform;
    // shader.materialPropUniforms.texTransform = texTransUni;

    trigger.trigger();

    cgl.popShader();
}

function updateDiffuseTexture()
{

    if (diffuseTexture.get())
    {

        // shader.materialPropUniforms.diffuseTexture = diffuseTextureUniform;
    }
    else
    {
        // shader.removeUniform("texDiffuse");
        // shader.removeDefine("HAS_TEXTURE_DIFFUSE");
        // diffuseTextureUniform = null;
    }
}

function updateDefines()
{
    // shader.toggleDefine("USE_TEX_ALBEDO", whichTex.get() == "Albedo");
}
