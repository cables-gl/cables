const execute = op.inTrigger("execute");
const r = op.inValueSlider("diffuse r", Math.random());
const g = op.inValueSlider("diffuse g", Math.random());
const b = op.inValueSlider("diffuse b", Math.random());
const a = op.inValueSlider("diffuse a", 1.0);

const inToggleDoubleSided = op.inBool("Double Sided", false);

inToggleDoubleSided.onChange = function ()
{
    shader.toggleDefine("DOUBLE_SIDED", inToggleDoubleSided.get());
};

const next = op.outTrigger("next");

r.setUiAttribs({ "colorPick": true });

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, "LambertMaterial");
shader.define("NUM_LIGHTS", "1");

const colUni = new CGL.Uniform(shader, "4f", "color", r, g, b, a);

const outShader = op.outObject("Shader");
outShader.set(shader);

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
    lights[count].radius = new CGL.Uniform(shader, "f", "lights[" + count + "].radius", 1000);
}

shader.setSource(attachments.lambert_vert, attachments.lambert_frag);

let numLights = -1;
const updateLights = function ()
{
    let count = 0;
    let i = 0;
    let num = 0;
    if (!cgl.tempData.lightStack && (!cgl.tempData.phong || !cgl.tempData.phong.lights))
    {
        num = 0;
    }
    else
    {
        if (cgl.tempData.phong)
        {
            if (cgl.tempData.phong.lights)
            {
                for (i in cgl.tempData.phong.lights) num++;
            }
        }

        for (const light in cgl.tempData.lightStack)
        {
            if (cgl.tempData.lightStack[light].type === "point")
            {
                num++;
            }
        }
    }

    if (num != numLights)
    {
        numLights = num;
        shader.define("NUM_LIGHTS", "" + Math.max(numLights, 1));
    }

    if (!cgl.tempData.lightStack && (!cgl.tempData.phong || !cgl.tempData.phong.lights))
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
        {
            if (cgl.tempData.phong)
            {
                if (cgl.tempData.phong.lights)
                {
                    const length = cgl.tempData.phong.lights.length;
                    for (let i = 0; i < length; i += 1)
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
                            lights[count].attenuation.setValue(cgl.tempData.phong.lights[i].attenuation);
                            lights[count].type.setValue(cgl.tempData.phong.lights[i].type);
                            if (cgl.tempData.phong.lights[i].cone) lights[count].cone.setValue(cgl.tempData.phong.lights[i].cone);
                            if (cgl.tempData.phong.lights[i].depthTex) lights[count].texDepthTex = cgl.tempData.phong.lights[i].depthTex;

                            lights[count].mul.setValue(cgl.tempData.phong.lights[i].mul || 1);
                        }

                        count++;
                    }
                }
            }
            if (cgl.tempData.lightStack)
            {
                if (cgl.tempData.lightStack.length)
                {
                    for (let j = 0; j < cgl.tempData.lightStack.length; j += 1)
                    {
                        const light = cgl.tempData.lightStack[j];
                        if (light.type === "point")
                        { // POINT LIGHT
                            lights[count].pos.setValue(light.position);
                            lights[count].fallOff.setValue(light.falloff);
                            lights[count].radius.setValue(light.radius);
                            lights[count].color.setValue(light.color);
                            lights[count].ambient.setValue([0, 0, 0]);
                            lights[count].type.setValue(0); // old point light type index
                            lights[count].mul.setValue(light.intensity);
                            count++;
                        }
                    }
                }
            }
        }
    }
};

function updateSpecular()
{
    if (inSpecular.get() == 1)inSpecular.uniform.setValue(99999);
    else inSpecular.uniform.setValue(Math.exp(inSpecular.get() * 8, 2));
}

execute.onTriggered = function ()
{
    if (!shader)
    {
        op.logError("lambert has no shader...");
        return;
    }

    cgl.pushShader(shader);
    updateLights();
    next.trigger();
    cgl.popShader();
};
