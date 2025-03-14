const execute = op.inTrigger("execute"),
    r = op.inValueSlider("r", Math.random()),
    g = op.inValueSlider("g", Math.random()),
    b = op.inValueSlider("b", Math.random()),
    a = op.inValueSlider("a", 1.0);
r.setUiAttribs({ "colorPick": true });

const inFesnel = op.inValueSlider("Fesnel", 0),
    inShininess = op.inValueSlider("Specular Shininess", 0.75),
    inSpecAmount = op.inValueSlider("Specular Amount", 0.5),
    next = op.outTrigger("next");

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, "PhongMaterial3");
// shader.setModules(['MODULE_VERTEX_POSITION','MODULE_COLOR','MODULE_NORMAL','MODULE_BEGIN_FRAG']);
shader.define("NUM_LIGHTS", "1");

const shaderOut = op.outObject("shader");
shaderOut.setRef(shader);
shaderOut.ignoreValueSerialize = true;

r.uniform = new CGL.Uniform(shader, "f", "r", r);
g.uniform = new CGL.Uniform(shader, "f", "g", g);
b.uniform = new CGL.Uniform(shader, "f", "b", b);
a.uniform = new CGL.Uniform(shader, "f", "a", a);

a.set(1.0);
const inColorize = op.inValueBool("Colorize Texture", false);
const inDoubleSided = op.inValueBool("Double Sided", false);

inFesnel.uniform = new CGL.Uniform(shader, "f", "fresnel", inFesnel);
inShininess.uniform = new CGL.Uniform(shader, "f", "specShininess", inShininess);
inSpecAmount.uniform = new CGL.Uniform(shader, "f", "specAmount", inSpecAmount);

const MAX_LIGHTS = 16;
const lights = [];
for (let i = 0; i < MAX_LIGHTS; i++)
{
    const count = i;
    lights[count] = {};
    lights[count].pos = new CGL.Uniform(shader, "3f", "lights[" + count + "].pos", [0, 11, 0]);
    lights[count].target = new CGL.Uniform(shader, "3f", "lights[" + count + "].target", [0, 0, 0]);
    lights[count].color = new CGL.Uniform(shader, "3f", "lights[" + count + "].color", [1, 1, 1]);
    lights[count].attenuation = new CGL.Uniform(shader, "f", "lights[" + count + "].attenuation", 0.1);
    lights[count].type = new CGL.Uniform(shader, "f", "lights[" + count + "].type", 0);
    lights[count].cone = new CGL.Uniform(shader, "f", "lights[" + count + "].cone", 0.8);
    lights[count].mul = new CGL.Uniform(shader, "f", "lights[" + count + "].mul", 1);

    lights[count].ambient = new CGL.Uniform(shader, "3f", "lights[" + count + "].ambient", 1);

    lights[count].fallOff = new CGL.Uniform(shader, "f", "lights[" + count + "].falloff", 0);
    lights[count].radius = new CGL.Uniform(shader, "f", "lights[" + count + "].radius", 10);
}

shader.setSource(attachments.phong_vert, attachments.phong_frag);

let numLights = -1;
const updateLights = function ()
{
    let count = 0;
    let i = 0;
    let num = 0;
    if (!cgl.tempData.phong || !cgl.tempData.phong.lights)
    {
        num = 0;
    }
    else
    {
        for (i in cgl.tempData.phong.lights)
        {
            num++;
        }
    }

    if (num != numLights)
    {
        numLights = num;
        shader.define("NUM_LIGHTS", "" + Math.max(numLights, 1));
    }

    if (!cgl.tempData.phong || !cgl.tempData.phong.lights)
    {
        lights[count].pos.setValue([5, 5, 5]);
        lights[count].color.setValue([1, 1, 1]);
        lights[count].ambient.setValue([0.1, 0.1, 0.1]);
        lights[count].mul.setValue(1);
        lights[count].fallOff.setValue(0.5);
    }
    else
    {
        count = 0;
        if (shader)
            for (i in cgl.tempData.phong.lights)
            {
                lights[count].pos.setValue(cgl.tempData.phong.lights[i].pos);
                // if(cgl.tempData.phong.lights[i].changed)
                {
                    cgl.tempData.phong.lights[i].changed = false;
                    if (cgl.tempData.phong.lights[i].target) lights[count].target.setValue(cgl.tempData.phong.lights[i].target);

                    lights[count].fallOff.setValue(cgl.tempData.phong.lights[i].fallOff);
                    lights[count].radius.setValue(cgl.tempData.phong.lights[i].radius);

                    lights[count].color.setValue(cgl.tempData.phong.lights[i].color);
                    lights[count].ambient.setValue(cgl.tempData.phong.lights[i].ambient);
                    // lights[count].specular.setValue(cgl.tempData.phong.lights[i].specular);
                    lights[count].attenuation.setValue(cgl.tempData.phong.lights[i].attenuation);
                    lights[count].type.setValue(cgl.tempData.phong.lights[i].type);
                    if (cgl.tempData.phong.lights[i].cone) lights[count].cone.setValue(cgl.tempData.phong.lights[i].cone);
                    if (cgl.tempData.phong.lights[i].depthTex) lights[count].texDepthTex = cgl.tempData.phong.lights[i].depthTex;

                    lights[count].mul.setValue(cgl.tempData.phong.lights[i].mul || 1);
                }

                count++;
            }
    }
};

inColorize.onChange = function ()
{
    if (inColorize.get()) shader.define("COLORIZE_TEXTURE");
    else shader.removeDefine("COLORIZE_TEXTURE");
};

inDoubleSided.onChange = function ()
{
    if (inDoubleSided.get()) shader.define("DOUBLESIDED");
    else shader.removeDefine("DOUBLESIDED");
};

function texturingChanged()
{
    if (diffuseTexture.get() || normalTexture.get() || specTexture.get() || aoTexture.get() || emissiveTexture.get())
    {
        shader.define("HAS_TEXTURES");
    }
    else
    {
        shader.removeDefine("HAS_TEXTURES");
    }
}

// diffuse texture
var diffuseTexture = op.inTexture("Diffuse Texture");
let diffuseTextureUniform = null;
shader.bindTextures = bindTextures;

diffuseTexture.onChange = function ()
{
    texturingChanged();
    if (diffuseTexture.get())
    {
        if (diffuseTextureUniform !== null) return;
        shader.removeUniform("texDiffuse");
        shader.define("HAS_TEXTURE_DIFFUSE");
        diffuseTextureUniform = new CGL.Uniform(shader, "t", "texDiffuse", 0);
    }
    else
    {
        shader.removeUniform("texDiffuse");
        shader.removeDefine("HAS_TEXTURE_DIFFUSE");
        diffuseTextureUniform = null;
    }
};

// normal texture
var normalTexture = op.inTexture("Normal Texture");
let normalTextureUniform = null;

normalTexture.onChange = function ()
{
    texturingChanged();
    if (normalTexture.get())
    {
        if (normalTextureUniform !== null) return;
        shader.removeUniform("texNormal");
        shader.define("HAS_TEXTURE_NORMAL");
        normalTextureUniform = new CGL.Uniform(shader, "t", "texNormal", 3);
    }
    else
    {
        shader.removeUniform("texNormal");
        shader.removeDefine("HAS_TEXTURE_NORMAL");
        normalTextureUniform = null;
    }
};

// specular texture
var specTexture = op.inTexture("Specular Texture");
let specTextureUniform = null;

specTexture.onChange = function ()
{
    if (specTexture.get())
    {
        if (specTextureUniform !== null) return;
        shader.removeUniform("texSpecular");
        shader.define("HAS_TEXTURE_SPECULAR");
        specTextureUniform = new CGL.Uniform(shader, "t", "texSpecular", 2);
    }
    else
    {
        shader.removeUniform("texSpecular");
        shader.removeDefine("HAS_TEXTURE_SPECULAR");
        specTextureUniform = null;
    }
};

// ao texture
var aoTexture = op.inTexture("AO Texture");
let aoTextureUniform = null;
aoTexture.ignoreValueSerialize = true;
shader.bindTextures = bindTextures;

aoTexture.onChange = function ()
{
    if (aoTexture.get())
    {
        if (aoTextureUniform !== null) return;
        shader.removeUniform("texAo");
        shader.define("HAS_TEXTURE_AO");
        aoTextureUniform = new CGL.Uniform(shader, "t", "texAo", 1);
    }
    else
    {
        shader.removeUniform("texAo");
        shader.removeDefine("HAS_TEXTURE_AO");
        aoTextureUniform = null;
    }
};

// emissive texture
var emissiveTexture = op.inTexture("Emissive Texture");
emissiveTexture.uniform = new CGL.Uniform(shader, "t", "texEmissive", 4);
emissiveTexture.ignoreValueSerialize = true;
shader.bindTextures = bindTextures;

emissiveTexture.onChange = function ()
{
    if (emissiveTexture.get())
    {
        // if(aoTextureUniform!==null)return;
        // shader.removeUniform('texEmissive');
        shader.define("HAS_TEXTURE_EMISSIVE");
    }
    else
    {
        // shader.removeUniform('texAo');
        shader.removeDefine("HAS_TEXTURE_EMISSIVE");
        // aoTextureUniform=null;
    }
};

function bindTextures()
{
    if (diffuseTexture.get())
    {
        cgl.setTexture(0, diffuseTexture.get().tex);
        // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, diffuseTexture.get().tex);
    }

    if (aoTexture.get())
    {
        cgl.setTexture(1, aoTexture.get().tex);
        // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, aoTexture.get().tex);
    }

    if (specTexture.get())
    {
        cgl.setTexture(2, specTexture.get().tex);
        // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, specTexture.get().tex);
    }

    if (normalTexture.get())
    {
        cgl.setTexture(3, normalTexture.get().tex);
        // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, normalTexture.get().tex);
    }

    if (emissiveTexture.get())
    {
        cgl.setTexture(4, emissiveTexture.get().tex);
        // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, emissiveTexture.get().tex);
    }
}

const toggleLambert = op.inValueBool("Toggle Light Shading", true);
toggleLambert.setUiAttribs({ "hidePort": true });
toggleLambert.onChange = updateToggles;

const toggleDiffuse = op.inValueBool("Toggle Diffuse Texture", true);
toggleDiffuse.setUiAttribs({ "hidePort": true });
toggleDiffuse.onChange = updateToggles;

const toggleNormal = op.inValueBool("Toggle Normal Texture", true);
toggleNormal.setUiAttribs({ "hidePort": true });
toggleNormal.onChange = updateToggles;

// var toggleSpecular=op.inValueBool("Toggle Specular",true);
// toggleSpecular.setUiAttribs({"hidePort":true});
// toggleSpecular.onChange=updateToggles;

const toggleAo = op.inValueBool("Toggle Ao Texture", true);
toggleAo.setUiAttribs({ "hidePort": true });
toggleAo.onChange = updateToggles;

const toggleFalloff = op.inValueBool("Toggle Falloff", true);
toggleFalloff.setUiAttribs({ "hidePort": true });
toggleFalloff.onChange = updateToggles;

const toggleEmissive = op.inValueBool("Toggle Emissive", true);
toggleEmissive.setUiAttribs({ "hidePort": true });
toggleEmissive.onChange = updateToggles;

const toggleSpecular = op.inValueBool("Toggle Specular", true);
toggleSpecular.setUiAttribs({ "hidePort": true });
toggleSpecular.onChange = updateToggles;

const toggleFresnel = op.inValueBool("Toggle Fresnel", true);
toggleFresnel.setUiAttribs({ "hidePort": true });
toggleFresnel.onChange = updateToggles;

function updateToggles()
{
    if (toggleLambert.get())shader.define("SHOW_LAMBERT");
    else shader.removeDefine("SHOW_LAMBERT");

    if (toggleDiffuse.get())shader.define("SHOW_DIFFUSE");
    else shader.removeDefine("SHOW_DIFFUSE");

    if (toggleSpecular.get())shader.define("SHOW_SPECULAR");
    else shader.removeDefine("SHOW_SPECULAR");

    if (toggleNormal.get())shader.define("SHOW_NORMAL");
    else shader.removeDefine("SHOW_NORMAL");

    if (toggleAo.get())shader.define("SHOW_AO");
    else shader.removeDefine("SHOW_AO");

    if (toggleFalloff.get())shader.define("SHOW_FALLOFF");
    else shader.removeDefine("SHOW_FALLOFF");

    if (toggleEmissive.get())shader.define("SHOW_EMISSIVE");
    else shader.removeDefine("SHOW_EMISSIVE");

    if (toggleFresnel.get())shader.define("ENABLE_FRESNEL");
    else shader.removeDefine("ENABLE_FRESNEL");

    if (toggleSpecular.get())shader.define("ENABLE_SPECULAR");
    else shader.removeDefine("ENABLE_SPECULAR");
}

updateToggles();

op.preRender =
execute.onTriggered = function ()
{
    if (!shader) return;

    cgl.pushShader(shader);
    updateLights();
    bindTextures();
    next.trigger();
    cgl.popShader();
};
