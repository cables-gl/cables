function clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
}

const execute=op.inTrigger("execute");
const r = op.inValueSlider("diffuse r", Math.random());
const g = op.inValueSlider("diffuse g", Math.random());
const b = op.inValueSlider("diffuse b", Math.random());
const a = op.inValueSlider("diffuse a", 1.0);

const inToggleDoubleSided = op.inBool("Double Sided", false);

const inShadow = op.inBool("Receive Shadow", false);
inToggleDoubleSided.onChange = function () {
    shader.toggleDefine("DOUBLE_SIDED", inToggleDoubleSided.get());
};
inShadow.onChange = function() {
    if (inShadow.get()) shader.define("SHADOW_MAP")
    else shader.removeDefine("SHADOW_MAP");
}

const algorithms = ['Default', 'PCF', 'Poisson', 'VSM'];
const inAlgorithm = op.inSwitch("Algorithm", algorithms, 'Default');
const inSamples = op.inSwitch("Samples", [1, 2, 4, 8, 16], 4);
const inNormalOffset = op.inFloatSlider("Normal Offset", 0);

inSamples.setUiAttribs({ greyout: true });
op.setPortGroup("", [inShadow]);
op.setPortGroup("Shadow Settings", [inAlgorithm, inSamples, inNormalOffset]);
inAlgorithm.onChange = function() {
    const selectedAlgorithm = inAlgorithm.get();
    algorithms.forEach(function(algorithm) {
        if (selectedAlgorithm === algorithm) {
            shader.define("MODE_" + algorithm.toUpperCase());
            if (algorithm !== "Default") {
                inSamples.setUiAttribs({ greyout: false });
            } else {
                inSamples.setUiAttribs({ greyout: true });
            }
        }
        else shader.removeDefine("MODE_" + algorithm.toUpperCase());
    });

}
const next=op.outTrigger("next");

r.setUiAttribs({ colorPick: true });

const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl,"LambertMaterial");
shader.define("MODE_PCF");
shader.define('NUM_LIGHTS','1');


inSamples.onChange = function() {
    shader.define("SAMPLE_AMOUNT", clamp(Number(inSamples.get()), 1, 16).toString());
}
shader.define("SAMPLE_AMOUNT", clamp(Number(inSamples.get()), 1, 16).toString());

const colUni=new CGL.Uniform(shader,'4f','materialColor',r,g,b,a);
const uniformNormalOffset = new CGL.Uniform(shader, 'f', 'inNormalOffset', inNormalOffset);
var outShader=op.outObject("Shader");
outShader.set(shader);
const outTex = op.outTexture("Shadow Map");

const MAX_LIGHTS = 16;
const lights = [];
const lightMatrices = [];
const shadowCubeMaps = [];

for(var i=0;i<MAX_LIGHTS;i++)
{
    var count=i;
    lights[count]={};
    lights[count].pos=new CGL.Uniform(shader,'3f','lights['+count+'].pos',[0,11,0]);
    lights[count].target=new CGL.Uniform(shader,'3f','lights['+count+'].target',[0,0,0]);
    lights[count].color=new CGL.Uniform(shader,'3f','lights['+count+'].color',[1,1,1]);
    lights[count].attenuation=new CGL.Uniform(shader,'f','lights['+count+'].attenuation',0.1);

    lights[count].type=new CGL.Uniform(shader,'i','lights['+count+'].type',0);
    lights[count].conePointAt=new CGL.Uniform(shader,'3f','lights['+count+'].conePointAt', vec3.create());
    lights[count].mul=new CGL.Uniform(shader,'f','lights['+count+'].mul',1);
    lights[count].ambient=new CGL.Uniform(shader,'3f','lights['+count+'].ambient',1);
    lights[count].fallOff=new CGL.Uniform(shader,'f','lights['+count+'].falloff',0);
    lights[count].radius=new CGL.Uniform(shader,'f','lights['+count+'].radius',1000);
    lights[count].cosConeAngleInner=new CGL.Uniform(shader,'f','lights['+count+'].cosConeAngleInner',0);
    lights[count].cosConeAngle=new CGL.Uniform(shader,'f','lights['+count+'].cosConeAngle',0);
    lights[count].spotExponent=new CGL.Uniform(shader,'f','lights['+count+'].spotExponent',0);
    lights[count].type=new CGL.Uniform(shader,'i','lights['+count+'].type',0);
    lights[count].lightMatrix=new CGL.Uniform(shader,'m4','lights['+count+'].lightMatrix',mat4.create());
    lights[count].castShadow=new CGL.Uniform(shader,'i','lights['+count+'].castShadow', 0);
    lights[count].nearFar=new CGL.Uniform(shader,'2f','lights['+count+'].nearFar', vec2.create());
    lights[count].shadowMap = null;
    lights[count].shadowCubeMap = null;
    lights[count].shadowMapWidth = new CGL.Uniform(shader, 'f', 'lights[' + count + '].shadowMapWidth', 0);
    lights[count].shadowBias = new CGL.Uniform(shader, 'f', 'lights[' + count + '].shadowBias', 0);
    lightMatrices[count] = new CGL.Uniform(shader,'m4','lightMatrices['+count+']', mat4.create());
    shadowCubeMaps[count] = null;
}

op.log(shadowCubeMaps);
shader.setSource(attachments.lambert_vert,attachments.lambert_frag);
let shadowCubeMap = new CGL.Uniform(shader, 't', 'shadowCubeMap', 12);


shader.bindTextures = function() {
}
const SHADOWMAP_DEFINES = [

];
var numLights=-1;
function setDefaultLight() {

}

const LIGHT_TYPES = { point: 0, directional: 1, spot: 2 };
const inverseViewMat = mat4.create();
const camPos = vec3.create();

var updateLights=function()
{
    var count=0;
    var i=0;
    var num=0;
    if((!cgl.lightStack || !cgl.lightStack.length) && (!cgl.frameStore.phong || !cgl.frameStore.phong.lights))
    {
        num=0;
    }
    else
    {
        if (cgl.frameStore.phong) {
            if (cgl.frameStore.phong.lights) {
                for(i in cgl.frameStore.phong.lights) num++;
            }
        }

        for (let light in cgl.lightStack) {
            if (cgl.lightStack[light].type !== "ambient") {
                num++;
            }
        }

    }

    if(num!=numLights)
    {
        numLights=num;

        shader.define('NUM_LIGHTS',''+Math.max(numLights, 1));

    }

    if((!cgl.lightStack || !cgl.lightStack.length) && (!cgl.frameStore.phong || !cgl.frameStore.phong.lights))
    {
        shader.removeDefine("SHADOW_MAP");
        lights.forEach(l => l.shadowMap = null); // Does this clear textures?
        shadowCubeMap = null;
        lights[count].pos.setValue([5, 5, 5]);
        lights[count].color.setValue([1,1,1]);
        lights[count].ambient.setValue([0.1,0.1,0.1]);
        lights[count].mul.setValue(1);
        lights[count].fallOff.setValue(0.5);
        lights[count].type.setValue(LIGHT_TYPES.point);
        lights[count].castShadow.setValue(0);

    }
    else
    {
        count=0;
        if(shader) {
            if (cgl.frameStore.phong) {
                if (cgl.frameStore.phong.lights) {
                    let length = cgl.frameStore.phong.lights.length;
                    for(let i = 0; i < length; i +=1) {
                        lights[count].pos.setValue(cgl.frameStore.phong.lights[i].pos);
                        // if(cgl.frameStore.phong.lights[i].changed)
                        {
                            cgl.frameStore.phong.lights[i].changed=false;
                            if(cgl.frameStore.phong.lights[i].target) lights[count].target.setValue(cgl.frameStore.phong.lights[i].target);

                            lights[count].fallOff.setValue(cgl.frameStore.phong.lights[i].fallOff);
                            lights[count].radius.setValue(cgl.frameStore.phong.lights[i].radius);
                            lights[count].color.setValue(cgl.frameStore.phong.lights[i].color);
                            lights[count].ambient.setValue(cgl.frameStore.phong.lights[i].ambient);
                            lights[count].attenuation.setValue(cgl.frameStore.phong.lights[i].attenuation);
                            lights[count].type.setValue(cgl.frameStore.phong.lights[i].type);

                            if(cgl.frameStore.phong.lights[i].cone) lights[count].cone.setValue(cgl.frameStore.phong.lights[i].cone);
                            if(cgl.frameStore.phong.lights[i].depthTex) lights[count].texDepthTex=cgl.frameStore.phong.lights[i].depthTex;

                            lights[count].mul.setValue(cgl.frameStore.phong.lights[i].mul||1);
                        }
                        count++;

                    }
                }
            }
            if (cgl.lightStack) {
                if (cgl.lightStack.length) {
                        for (let j = 0; j < cgl.lightStack.length; j += 1) {
                            const light = cgl.lightStack[j];
                            lights[count].pos.setValue(light.position);
                            lights[count].fallOff.setValue(light.falloff);
                            lights[count].radius.setValue(light.radius);
                            lights[count].color.setValue(light.color);
                            lights[count].ambient.setValue([0, 0, 0]); // TODO: Remove
                            lights[count].conePointAt.setValue(light.conePointAt);
                            lights[count].cosConeAngle.setValue(light.cosConeAngle);
                            lights[count].cosConeAngleInner.setValue(light.cosConeAngleInner);
                            lights[count].spotExponent.setValue(light.spotExponent);
                            lights[count].type.setValue(LIGHT_TYPES[light.type]);
                            lights[count].mul.setValue(light.intensity);
                            lights[count].castShadow.setValue(Number(light.castShadow));

                            if (light.castShadow) {
                                if (inShadow.get() && !shader.hasDefine("SHADOW_MAP")) shader.define("SHADOW_MAP");
                                if (light.lightMatrix) lightMatrices[count].setValue(light.lightMatrix);

                                lights[count].shadowBias.setValue(light.shadowBias);

                                if (light.shadowMap) {
                                    if (!lights[count].shadowMap) {
                                        lights[count].shadowMap = new CGL.Uniform(shader,'t','lights[' + count + '].shadowMap', count);
                                    }
                                    cgl.setTexture(count, light.shadowMap.tex);
                                    lights[count].shadowMapWidth.setValue(light.shadowMap.width);

                                } else if (light.shadowCubeMap) {
                                    lights[count].nearFar.setValue(light.nearFar);
                                    /* if (!shadowCubeMaps[count]) {
                                        shadowCubeMaps[count] = new CGL.Uniform(shader,'t','shadowCubeMaps[' + count + '].cubeMap', count);
                                    } */
                                    cgl.setTexture(12, light.shadowCubeMap.cubemap, cgl.gl.TEXTURE_CUBE_MAP);
                                    /*

                                    */
                                    lights[count].shadowMapWidth.setValue(light.shadowCubeMap.width);
                                }
                            } else { // if castShadow = false, remove uniform.. should that be done?
                                if (lights[count].shadowMap) {
                                    shader.removeUniform('lights[' + count + '].shadowMap');
                                    lights[count].shadowMap = null;
                                }
                                else if (shadowCubeMaps[count]) {
                                    shader.removeUniform('shadowCubeMaps[' + count + '].cubeMap');
                                    shadowCubeMaps[count] = null;
                                }
                            }
                            count++;
                        }
                    }
                }
        }
    }
};

execute.onTriggered=function()
{
    if(!shader)
    {
        console.log("lambert has no shader...");
        return;
    }
    // cgl.shadowPass = true;


    if (cgl.shadowPass) {
        next.trigger();
    }
    else {
        cgl.setShader(shader);
        shader.bindTextures();

        updateLights();
        next.trigger();

        cgl.setPreviousShader();
    }
};