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
    shader.toggleDefine("SHADOW_MAP", inShadow.get());


}

const algorithms = ['Default','Bias', 'PCF', 'Poisson', 'Stratified', 'VSM'];
const inAlgorithm = op.inSwitch("Algorithm", algorithms, 'Default');
inAlgorithm.onChange = function() {
    const selectedAlgorithm = inAlgorithm.get();
    algorithms.forEach(function(algorithm) {
        if (selectedAlgorithm === algorithm) {
            shader.define("MODE_" + algorithm.toUpperCase());
            if (algorithm !== "Default") {
                inBias.setUiAttribs({ greyout: false });
                inSamples.setUiAttribs({ greyout: false });
            } else {
                inBias.setUiAttribs({ greyout: true });
                inSamples.setUiAttribs({ greyout: true });
            }
        }
        else shader.removeDefine("MODE_" + algorithm.toUpperCase());
    });

}

const inBias = op.inFloatSlider("Bias", 0.005);
inBias.setUiAttribs({ greyout: true });
const inSamples = op.inInt("Samples", 4);
inSamples.setUiAttribs({ greyout: true });
const inShadowStrength = op.inFloatSlider("Shadow Strength", 1);
const next=op.outTrigger("next");

r.setUiAttribs({ colorPick: true });

const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl,"LambertMaterial");
shader.define("MODE_DEFAULT");
shader.define('NUM_LIGHTS','1');

inSamples.onChange = function() {
    shader.define("SAMPLE_AMOUNT", clamp(inSamples.get(), 1, 16).toString());
}
shader.define("SAMPLE_AMOUNT", clamp(inSamples.get(), 1, 16).toString());

const uniformBias = new CGL.Uniform(shader, "f", "inBias", inBias);
const defaultShader = new CGL.Shader(cgl, "lambertDefault");
defaultShader.setModules(['MODULE_VERTEX_POSITION', 'MODULE_COLOR', 'MODULE_BEGIN_FRAG']);
defaultShader.setSource(defaultShader.getDefaultVertexShader(), defaultShader.getDefaultFragmentShader());


const colUni=new CGL.Uniform(shader,'4f','materialColor',r,g,b,a);

var outShader=op.outObject("Shader");
outShader.set(shader);
const outTex = op.outTexture("Shadow Map");
var MAX_LIGHTS=16;
var lights=[];
const lightMatrices = [];
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
    lights[count].shadowMapWidth = new CGL.Uniform(shader, 'f', 'lights[' + count + '].shadowMapWidth', 0);
    lights[count].shadowBias = new CGL.Uniform(shader, 'f', 'lights[' + count + '].shadowBias', 0);
    lightMatrices[count] = new CGL.Uniform(shader,'m4','lightMatrices['+count+']', mat4.create());
}

shader.setSource(attachments.lambert_vert,attachments.lambert_frag);
let shadowCubeMap = new CGL.Uniform(shader, 't', 'shadowCubeMap', 1);

shader.bindTextures = function() {
    /*
    if (cgl.frameStore.shadowMap || cgl.frameStore.shadowCubeMap) {
        if (inShadow.get()) {

            if (cgl.frameStore.shadowMap) {
                cgl.setTexture(0, cgl.frameStore.shadowMap.tex);
                uniformShadowMapSize.setValue(cgl.frameStore.shadowMap.width);
            }

            if (cgl.frameStore.shadowCubeMap) {
                    cgl.setTexture(1, cgl.frameStore.shadowCubeMap.cubemap, cgl.gl.TEXTURE_CUBE_MAP);
                    if (cgl.frameStore.shadowCubeMap.size) uniformShadowMapSize.setValue(cgl.frameStore.shadowCubeMap.size);
                    else uniformShadowMapSize.setValue(1024);

            }
            if (!shader.hasDefine("SHADOW_MAP")) shader.define("SHADOW_MAP");
        }
    } else {

        if (inShadow.get()) {
            if (!cgl.frameStore.shadowMap && !cgl.frameStore.shadowCubeMap) {
                if (shader.hasDefine("SHADOW_MAP")) {
                    shader.removeDefine("SHADOW_MAP");
                }
            }
        }
    }
    */
}
const SHADOWMAP_DEFINES = [

];
var numLights=-1;
var updateLights=function()
{
    var count=0;
    var i=0;
    var num=0;
    if(!cgl.lightStack && (!cgl.frameStore.phong || !cgl.frameStore.phong.lights))
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

        lights[count].pos.setValue([5,5,5]);
        lights[count].color.setValue([1,1,1]);
        lights[count].ambient.setValue([0.1,0.1,0.1]);
        lights[count].mul.setValue(1);
        lights[count].fallOff.setValue(0.5);

        if (lights[count].shadowMap) {
    //        shader.removeUniform('lights[' + count + '].shadowMap'); // lights[count].shadowMap = null;
    //        lights[count].shadowMap = null;
        }
        // lights[count].castShadow.setValue(0);
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
                                 if (light.type === "point") { // POINT LIGHT
                                    lights[count].pos.setValue(light.position);
                                    lights[count].fallOff.setValue(light.falloff);
                                    lights[count].radius.setValue(light.radius);
                                    lights[count].color.setValue(light.color);
                                    lights[count].ambient.setValue([0, 0, 0]);
                                    lights[count].nearFar.setValue(light.nearFar);
                                    lights[count].type.setValue(0); // old point light type index


                                    lights[count].mul.setValue(light.intensity);
                                    lights[count].castShadow.setValue(Number(light.castShadow));

                                    count++;

                                 } else if (light.type === "directional") {

                                    lights[count].pos.setValue(light.position);
                                    lights[count].fallOff.setValue(light.falloff);
                                    lights[count].radius.setValue(light.radius);
                                    lights[count].color.setValue(light.color);
                                    lights[count].ambient.setValue([0, 0, 0]);
                                    lights[count].type.setValue(1);

                                    lights[count].mul.setValue(light.intensity);
                                    lights[count].castShadow.setValue(Number(light.castShadow));

                                    if (light.castShadow) {
                                        lightMatrices[count].setValue(light.lightMatrix);
                                        if (light.shadowMap) {
                                            if (!lights[count].shadowMap) {
                                                lights[count].shadowMap = new CGL.Uniform(shader,'t','lights[' + count + '].shadowMap', count);
                                            }
                                            cgl.setTexture(count, light.shadowMap.tex);
                                            lights[count].shadowMapWidth.setValue(light.shadowMap.width);
                                            lights[count].shadowBias.setValue(light.shadowBias);
                                        }
                                    } else {
                                        lightMatrices[count].setValue(null);
                                        if (lights[count].shadowMap) {
                                            shader.removeUniform('lights[' + count + '].shadowMap');
                                            lights[count].shadowMap = null;
                                        }
                                    }
                                    count++;


                                 } else if (light.type === "spot") {
                                    // op.log(count, Object.keys(lights[count]).map(k => ({ k: k, v: lights[count][k] ? lights[count][k]._value : "no value" })));
                                    lights[count].pos.setValue(light.position);
                                    lights[count].fallOff.setValue(light.falloff);
                                    lights[count].radius.setValue(light.radius);
                                    lights[count].color.setValue(light.color);
                                    lights[count].ambient.setValue([0, 0, 0]);
                                    lights[count].conePointAt.setValue(light.conePointAt);
                                    lights[count].cosConeAngle.setValue(light.cosConeAngle);
                                    lights[count].cosConeAngleInner.setValue(light.cosConeAngleInner);
                                    lights[count].spotExponent.setValue(light.spotExponent);
                                    lights[count].type.setValue(2);
                                    lights[count].mul.setValue(light.intensity);
                                    lights[count].castShadow.setValue(Number(light.castShadow));

                                    if (light.castShadow) {
                                        lightMatrices[count].setValue(light.lightMatrix);
                                        lights[count].lightMatrix.setValue(light.lightMatrix); // DEBUG

                                        //

                                        if (light.shadowMap) {
                                            if (!lights[count].shadowMap) {
                                                lights[count].shadowMap = new CGL.Uniform(shader,'t','lights[' + count + '].shadowMap', count);
                                            }

                                            cgl.setTexture(count, light.shadowMap.tex);
                                            // op.log("count", count, "unival", lights[count].shadowMap._value, "textures", cgl.getTexture(count) === lights[count].shadowMap.tex);
                                            op.log("count", count);
                                            op.log(lights[count].shadowMap);
                                            op.log(...shader.getDefines()[0]);
                                            // op.log("count", count, Array.from(lightMatrices[count]._value).sort().toString() === Array.from(light.lightMatrix).sort().toString());
                                            lights[count].shadowMapWidth.setValue(light.shadowMap.width);
                                            lights[count].shadowBias.setValue(light.shadowBias);
                                        }
                                    } else {
                                        // lightMatrices[count].setValue(null);
                                        if (lights[count].shadowMap) {
                                            shader.removeUniform('lights[' + count + '].shadowMap');
                                            lights[count].shadowMap = null;
                                        }
                                    }

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
    if(inSpecular.get()==1)inSpecular.uniform.setValue(99999);
        else inSpecular.uniform.setValue(Math.exp(inSpecular.get()*8,2));
}
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