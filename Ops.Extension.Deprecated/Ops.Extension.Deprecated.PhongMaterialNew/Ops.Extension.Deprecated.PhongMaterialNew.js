op.name = "PhongMaterial";
var cgl = this.patch.cgl;

// adapted from:
// http://www.tomdalling.com/blog/modern-opengl/07-more-lighting-ambient-specular-attenuation-gamma/

let render = this.addInPort(new CABLES.Port(this, "execute", CABLES.OP_PORT_TYPE_FUNCTION));

let trigger = this.addOutPort(new CABLES.Port(this, "next", CABLES.OP_PORT_TYPE_FUNCTION));
let shaderOut = this.addOutPort(new CABLES.Port(this, "shader", CABLES.OP_PORT_TYPE_OBJECT));

// var specularStrength=op.inValue("Specular Strength",1);
let shininess = op.inValueSlider("Shininess", 0.5);
let fresnel = op.inValueSlider("Fresnel", 0);

// diffuse color

shaderOut.ignoreValueSerialize = true;
let MAX_LIGHTS = 16;

var cgl = op.patch.cgl;
var shader = new CGL.Shader(cgl, "lambertmaterial");

var shader = new CGL.Shader(cgl, "PhongMaterial");
shader.setModules(["MODULE_VERTEX_POSITION", "MODULE_COLOR", "MODULE_NORMAL", "MODULE_BEGIN_FRAG"]);

shader.setSource(attachments.phong2_vert, attachments.phong2_frag);
shaderOut.set(shader);

// var unishininess=new CGL.Uniform(shader,'f','shininess',shininess);
let uniShininess = new CGL.Uniform(shader, "f", "shininess", 0);
let uniFresnel = new CGL.Uniform(shader, "f", "fresnel", fresnel);
shininess.onChange = updateShininess;

let lights = [];

let depthTex = new CGL.Uniform(shader, "t", "depthTex", 5);

let uniShadowPass = new CGL.Uniform(shader, "f", "shadowPass", 0);

for (var i = 0; i < MAX_LIGHTS; i++)
{
    let count = i;
    lights[count] = {};
    lights[count].pos = new CGL.Uniform(shader, "3f", "lights[" + count + "].pos", [0, 11, 0]);
    lights[count].target = new CGL.Uniform(shader, "3f", "lights[" + count + "].target", [0, 0, 0]);
    lights[count].color = new CGL.Uniform(shader, "3f", "lights[" + count + "].color", [1, 1, 1]);
    lights[count].attenuation = new CGL.Uniform(shader, "f", "lights[" + count + "].attenuation", 0.1);
    lights[count].type = new CGL.Uniform(shader, "f", "lights[" + count + "].type", 0);
    lights[count].cone = new CGL.Uniform(shader, "f", "lights[" + count + "].cone", 0.8);
    lights[count].mul = new CGL.Uniform(shader, "f", "lights[" + count + "].mul", 1);

    lights[count].ambient = new CGL.Uniform(shader, "3f", "lights[" + count + "].ambient", 1);
    lights[count].specular = new CGL.Uniform(shader, "3f", "lights[" + count + "].specular", 1);

    lights[count].fallOff = new CGL.Uniform(shader, "f", "lights[" + count + "].falloff", 0);
    lights[count].radius = new CGL.Uniform(shader, "f", "lights[" + count + "].radius", 10);

    //   vec3 pos;
    //   vec3 color;
    //   vec3 ambient;
    //   float falloff;
    //   float radius;

    // lights[count].depthMVP=new CGL.Uniform(shader,'m4','lights['+count+'].depthMVP',mat4.create());
}

let normIntensity = op.inValue("Normal Texture Intensity", 1);
let uniNormIntensity = new CGL.Uniform(shader, "f", "normalTexIntensity", normIntensity);

function updateShininess()
{
    if (shininess.get() == 1)uniShininess.setValue(99999);
    else uniShininess.setValue(Math.exp(shininess.get() * 8, 2));
}

{
    // diffuse color

    let r = this.addInPort(new CABLES.Port(this, "diffuse r", CABLES.OP_PORT_TYPE_VALUE, { "display": "range", "colorPick": "true" }));
    let g = this.addInPort(new CABLES.Port(this, "diffuse g", CABLES.OP_PORT_TYPE_VALUE, { "display": "range" }));
    let b = this.addInPort(new CABLES.Port(this, "diffuse b", CABLES.OP_PORT_TYPE_VALUE, { "display": "range" }));
    let a = this.addInPort(new CABLES.Port(this, "diffuse a", CABLES.OP_PORT_TYPE_VALUE, { "display": "range" }));

    r.uniform = new CGL.Uniform(shader, "f", "r", r);
    g.uniform = new CGL.Uniform(shader, "f", "g", g);
    b.uniform = new CGL.Uniform(shader, "f", "b", b);
    a.uniform = new CGL.Uniform(shader, "f", "a", a);

    r.set(Math.random());
    g.set(Math.random());
    b.set(Math.random());
    a.set(1.0);
}

{
    let colorizeTex = this.addInPort(new CABLES.Port(this, "colorize texture", CABLES.OP_PORT_TYPE_VALUE, { "display": "bool" }));
    colorizeTex.onChange = function ()
    {
        if (colorizeTex.get()) shader.define("COLORIZE_TEXTURE");
        else shader.removeDefine("COLORIZE_TEXTURE");
    };
}

{
    // diffuse texture
    var diffuseTexture = this.addInPort(new CABLES.Port(this, "texture", CABLES.OP_PORT_TYPE_TEXTURE, { "preview": true, "display": "createOpHelper" }));
    let diffuseTextureUniform = null;
    shader.bindTextures = bindTextures;

    diffuseTexture.onChange = function ()
    {
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

    var aoTexture = this.addInPort(new CABLES.Port(this, "AO Texture", CABLES.OP_PORT_TYPE_TEXTURE, { "preview": true, "display": "createOpHelper" }));
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

    var specTexture = this.addInPort(new CABLES.Port(this, "Specular Texture", CABLES.OP_PORT_TYPE_TEXTURE, { "preview": true, "display": "createOpHelper" }));
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

    var normalTexture = this.addInPort(new CABLES.Port(this, "Normal Texture", CABLES.OP_PORT_TYPE_TEXTURE, { "preview": true, "display": "createOpHelper" }));
    let normalTextureUniform = null;

    normalTexture.onChange = function ()
    {
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

    let diffuseRepeatX = this.addInPort(new CABLES.Port(this, "diffuseRepeatX", CABLES.OP_PORT_TYPE_VALUE));
    let diffuseRepeatY = this.addInPort(new CABLES.Port(this, "diffuseRepeatY", CABLES.OP_PORT_TYPE_VALUE));
    diffuseRepeatX.set(1);
    diffuseRepeatY.set(1);

    diffuseRepeatX.onChange = function ()
    {
        diffuseRepeatXUniform.setValue(diffuseRepeatX.get());
    };

    diffuseRepeatY.onChange = function ()
    {
        diffuseRepeatYUniform.setValue(diffuseRepeatY.get());
    };

    var diffuseRepeatXUniform = new CGL.Uniform(shader, "f", "diffuseRepeatX", diffuseRepeatX.get());
    var diffuseRepeatYUniform = new CGL.Uniform(shader, "f", "diffuseRepeatY", diffuseRepeatY.get());
}

{
    // lights
    let numLights = -1;

    var updateLights = function ()
    {
        let count = 0;
        let i = 0;
        let num = 0;
        if (!cglframeStorephong || !cglframeStorephong.lights)
        {
            num = 0;
        }
        else
        {
            for (i in cglframeStorephong.lights)
            {
                num++;
            }
        }
        if (num != numLights)
        {
            numLights = num;
            shader.define("NUM_LIGHTS", "" + Math.max(numLights, 1));
        }

        if (!cglframeStorephong || !cglframeStorephong.lights)
        {
            lights[count].pos.setValue([5, 5, 5]);
            lights[count].color.setValue([1, 1, 1]);
            lights[count].ambient.setValue([0, 0, 0]);
            lights[count].specular.setValue([1, 1, 1]);
        }
        else
        {
            count = 0;
            if (shader)
                for (i in cglframeStorephong.lights)
                {
                    lights[count].pos.setValue(cglframeStorephong.lights[i].pos);
                    // if(cglframeStorephong.lights[i].changed)
                    {
                        cglframeStorephong.lights[i].changed = false;
                        if (cglframeStorephong.lights[i].target) lights[count].target.setValue(cglframeStorephong.lights[i].target);

                        lights[count].fallOff.setValue(cglframeStorephong.lights[i].fallOff);
                        lights[count].radius.setValue(cglframeStorephong.lights[i].radius);

                        lights[count].color.setValue(cglframeStorephong.lights[i].color);
                        lights[count].ambient.setValue(cglframeStorephong.lights[i].ambient);
                        lights[count].specular.setValue(cglframeStorephong.lights[i].specular);
                        lights[count].attenuation.setValue(cglframeStorephong.lights[i].attenuation);
                        lights[count].type.setValue(cglframeStorephong.lights[i].type);
                        if (cglframeStorephong.lights[i].cone) lights[count].cone.setValue(cglframeStorephong.lights[i].cone);
                        // if(cglframeStorephong.lights[i].depthMVP) lights[count].depthMVP.setValue(cglframeStorephong.lights[i].depthMVP);
                        if (cglframeStorephong.lights[i].depthTex) lights[count].texDepthTex = cglframeStorephong.lights[i].depthTex;

                        lights[count].mul.setValue(cglframeStorephong.lights[i].mul || 1);
                    }

                    count++;
                }
        }
    };
}

var bindTextures = function ()
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

    uniShadowPass.setValue(0);
    if (cglframeStorephong && cglframeStorephong.lights)
        for (i in cglframeStorephong.lights)
        {
            if (cglframeStorephong.lights[i].shadowPass == 1.0)uniShadowPass.setValue(1);
        }
};

let doRender = function ()
{
    if (!shader) return;

    cgl.pushShader(shader);
    updateLights();
    shader.bindTextures();
    trigger.trigger();
    cgl.popShader();
};

shader.bindTextures = bindTextures;
shader.define("NUM_LIGHTS", "1");

// this.onLoaded=shader.compile;

render.onTriggered = doRender;

doRender();
updateShininess();
