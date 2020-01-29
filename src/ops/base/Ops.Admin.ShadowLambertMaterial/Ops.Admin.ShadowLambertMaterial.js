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
const inSamples = op.inSwitch("Samples", [1, 2, 4, 8], 4);

inSamples.setUiAttribs({ greyout: true });
op.setPortGroup("", [inShadow]);
op.setPortGroup("Shadow Settings", [inAlgorithm, inSamples]);
inAlgorithm.onChange = function() {
    const selectedAlgorithm = inAlgorithm.get();
    algorithms.forEach(function(algorithm) {
        if (selectedAlgorithm === algorithm) {
            shader.define("MODE_" + algorithm.toUpperCase());
            if (algorithm !== "Default" && algorithm !== "VSM") {
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
shader.define("MODE_DEFAULT");
shader.define('NUM_LIGHTS','1');

const IS_WEBGL_1 = cgl.glVersion == 1;
if (IS_WEBGL_1) {
    /*
    cgl.gl.getExtension('OES_texture_float');
    cgl.gl.getExtension('OES_texture_float_linear');
    cgl.gl.getExtension('OES_texture_half_float');
    cgl.gl.getExtension('OES_texture_half_float_linear');
    */
    shader.enableExtension("GL_OES_standard_derivatives");
    // NOTE: these are implicitly enabled:
    //shader.enableExtension("GL_OES_texture_float");
    //shader.enableExtension("GL_OES_texture_float_linear");
    //shader.enableExtension("GL_OES_texture_half_float");
    //shader.enableExtension("GL_OES_texture_half_float_linear");
}

inSamples.onChange = function() {
    shader.define("SAMPLE_AMOUNT", "float(" + clamp(Number(inSamples.get()), 1, 16).toString() + ")");
}
shader.define("SAMPLE_AMOUNT", "float(" + clamp(Number(inSamples.get()), 1, 16).toString() + ")");

const colUni=new CGL.Uniform(shader,'4f','materialColor',r,g,b,a);
var outShader=op.outObject("Shader");
outShader.set(shader);

const MAX_UNIFORM_FRAGMENTS = cgl.gl.getParameter(cgl.gl.MAX_FRAGMENT_UNIFORM_VECTORS);
const MAX_LIGHTS = MAX_UNIFORM_FRAGMENTS === 64 ? 6 : 16;
const MAX_TEXTURE_UNITS = cgl.gl.getParameter(cgl.gl.MAX_TEXTURE_IMAGE_UNITS);
const MAX_TEXTURE_SLOT = MAX_TEXTURE_UNITS - 1;

const lights = [];
const lightMatrices = [];
const shadowCubeMaps = [];
const normalOffsets = [];
for(var i=0;i<MAX_LIGHTS;i++)
{
    var count=i;
    /*
    const lightPropertiesUniform = new CGL.Uniform(shader, "3f", "lights" + "[" + i + "]" + ".lightProperties", lightProperties);
    const spotProperties = [null, null, null];
    const spotPropertiesUniform = new CGL.Uniform(shader, "3f", "lights" + "[" + i + "]" + ".spotProperties", spotProperties);

    lightUniforms.push({
        color: new CGL.Uniform(shader, "3f", "lights" + "[" + i + "]" + ".color", i === 0 ? initialLight.color : [0, 0, 0]),

        specular: new CGL.Uniform(shader, "3f", "lights" + "[" + i + "]" + ".specular", i === 0 ? initialLight.specular : [1, 1, 1]),

        position: new CGL.Uniform(shader, "3f", "lights" + "[" + i + "]" + ".position", i === 0 ? initialLight.position : [0, 0, 0]),

        type: new CGL.Uniform(shader, "i", "lights" + "[" + i + "]" + ".type", i === 0 ? LIGHT_TYPES.point : LIGHT_TYPES.none),

        lightProperties: lightPropertiesUniform,
        intensity: true,
        radius: true,
        falloff: true,

        // SPOT LIGHT
        spotProperties: spotPropertiesUniform,
        spotExponent: true,
        cosConeAngle: true,
        cosConeAngleInner: true,
        conePointAt: new CGL.Uniform(shader, "3f", "lights" + "[" + i + "]" + ".conePointAt", null)
    */
    lights[count]={};

    lights[count].color=new CGL.Uniform(shader,'3f','lights['+count+'].color',[1,1,1]);
    lights[count].position=new CGL.Uniform(shader,'3f','lights['+count+'].position',[0,11,0]);

    // intensity, attenuation, falloff, radius
    lights[count].lightProperties = new CGL.Uniform(shader, '4f', 'lights['+count+'].lightProperties', [1,1,1,1]);


    lights[count].typeCastShadow = new CGL.Uniform(shader, '2f', 'lights[' + count + '].typeCastShadow', [0, 0]);
    lights[count].type=new CGL.Uniform(shader,'i','lights['+count+'].type',0);
    lights[count].castShadow=new CGL.Uniform(shader,'i','lights['+count+'].castShadow', 0);


    lights[count].conePointAt=new CGL.Uniform(shader,'3f','lights['+count+'].conePointAt', vec3.create());
    lights[count].spotProperties = new CGL.Uniform(shader, '3f', 'lights[' + count + '].spotProperties', [0,0,0,0]);

    lights[count].shadowProperties = new CGL.Uniform(shader, '4f', 'lights[' + count + '].shadowProperties', [0,0,0,0]);

    /*
    lights[count].nearFar=new CGL.Uniform(shader,'2f','lights['+count+'].nearFar', vec2.create());
    lights[count].shadowMapWidth = new CGL.Uniform(shader, 'f', 'lights[' + count + '].shadowMapWidth', 0);
    lights[count].shadowBias = new CGL.Uniform(shader, 'f', 'lights[' + count + '].shadowBias', 0);
    */
    normalOffsets[count] = new CGL.Uniform(shader, 'f', 'normalOffsets[' + count + ']', 0);
    lights[count].shadowMap = null;
    lightMatrices[count] = new CGL.Uniform(shader,'m4','lightMatrices['+count+']', mat4.create());
}

shader.setSource(attachments.lambert_vert,attachments.lambert_frag);
let shadowCubeMap = new CGL.Uniform(shader, 't', 'shadowCubeMap', MAX_TEXTURE_SLOT);
op.log(shader.getUniforms().length);
// cgl.setTexture(8, CGL.Texture.getEmptyTexture(cgl).tex, cgl.gl.TEXTURE_CUBE_MAP);
var numLights=-1;

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
        lights[count].lightProperties.setValue([1,1,1,1]);
        lights[count].position.setValue([5, 5, 5]);
        lights[count].color.setValue([1,1,1]);
        lights[count].intensity.setValue(1);
        lights[count].falloff.setValue(0.5);
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
                        lights[count].position.setValue(cgl.frameStore.phong.lights[i].position);
                        // if(cgl.frameStore.phong.lights[i].changed)
                        {
                            cgl.frameStore.phong.lights[i].changed=false;

                            lights[count].falloff.setValue(cgl.frameStore.phong.lights[i].falloff);
                            lights[count].radius.setValue(cgl.frameStore.phong.lights[i].radius);
                            lights[count].color.setValue(cgl.frameStore.phong.lights[i].color);
                            lights[count].attenuation.setValue(cgl.frameStore.phong.lights[i].attenuation);
                            lights[count].type.setValue(cgl.frameStore.phong.lights[i].type);

                            if(cgl.frameStore.phong.lights[i].cone) lights[count].cone.setValue(cgl.frameStore.phong.lights[i].cone);
                            if(cgl.frameStore.phong.lights[i].depthTex) lights[count].texDepthTex=cgl.frameStore.phong.lights[i].depthTex;

                            lights[count].intensity.setValue(cgl.frameStore.phong.lights[i].intensity||1);
                        }
                        count++;

                    }
                }
            }
            if (cgl.lightStack) {
                if (cgl.lightStack.length) {
                        for (let j = 0; j < cgl.lightStack.length; j += 1) {
                            const light = cgl.lightStack[j];
                            lights[count].position.setValue(light.position);
                            lights[count].color.setValue(light.color);


                            lights[count].lightProperties.setValue([light.intensity, light.attenuation, light.falloff, light.radius]);

                            lights[count].conePointAt.setValue(light.conePointAt);
                            lights[count].spotProperties.setValue([light.cosConeAngle, light.cosConeAngleInner, light.spotExponent]);

                            lights[count].typeCastShadow.setValue(LIGHT_TYPES[light.type], light.castShadow);

                            lights[count].type.setValue(LIGHT_TYPES[light.type]);
                            lights[count].castShadow.setValue(Number(light.castShadow));
                            // intensity, attenuation, falloff, radius

                            if (light.castShadow && inShadow.get()) {
                                if (inShadow.get() && !shader.hasDefine("SHADOW_MAP")) shader.define("SHADOW_MAP");
                                if (light.lightMatrix) lightMatrices[count].setValue(light.lightMatrix);
                                if (light.type !== "point") normalOffsets[count].setValue(light.normalOffset);

                                lights[count].shadowProperties.setValue([light.nearFar[0], light.nearFar[1], light.shadowMap.width, light.shadowBias]);
                                /*
                                lights[count].shadowBias.setValue(light.shadowBias);
                                lights[count].nearFar.setValue(light.nearFar);
                                lights[count].shadowMapWidth.setValue(light.shadowMap.width);
                                */

                                if (light.shadowMap) {
                                    if (!lights[count].shadowMap) {
                                        lights[count].shadowMap = new CGL.Uniform(shader,'t','lights[' + count + '].shadowMap', count);
                                    }
                                    // shader.pushTexture(lights[count].shadowMap, light.shadowMap.tex);
                                    cgl.setTexture(count, light.shadowMap.tex);

                                } else if (light.shadowCubeMap) {
                                    // if (!shadowCubeMap) shadowCubeMap = new CGL.Uniform(shader, 't', 'shadowCubeMap', count);

                                    // shader.pushTexture(shadowCubeMap, light.shadowCubeMap.cubemap, cgl.gl.TEXTURE_CUBE_MAP);

                                    cgl.setTexture(MAX_TEXTURE_SLOT, light.shadowCubeMap.cubemap, cgl.gl.TEXTURE_CUBE_MAP);
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
// let shadowpasscount = 0;
// let normalpasscount = 0;
execute.onTriggered=function()
{
    if(!shader)
    {
        console.log("lambert has no shader...");
        return;
    }
    // cgl.shadowPass = true;


    if (cgl.shadowPass) {
        // if (shadowpasscount != 2) { op.log("ShadowPass!"); shadowpasscount++; }
        next.trigger();
    }
    else {
        // if (normalpasscount != 2) { op.log("NormalPass!"); normalpasscount++; }
        cgl.setShader(shader);

        updateLights();
        next.trigger();
        shader.popTextures();
        cgl.setPreviousShader();
    }
};