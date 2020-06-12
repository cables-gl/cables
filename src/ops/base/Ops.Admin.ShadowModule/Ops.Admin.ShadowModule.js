const cgl = op.patch.cgl;
const LIGHT_INDEX_REGEX = new RegExp("{{LIGHT_INDEX}}", "g");
const LIGHT_TYPES = { point: 0, directional: 1, spot: 2 };

function clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
}


const inTrigger = op.inTrigger("Trigger In");
const inCastShadow = op.inBool("Cast Shadow", true);
const inReceiveShadow = op.inBool("Receive Shadow", false);
const algorithms = ['Default', 'PCF', 'Poisson', 'VSM'];
const inAlgorithm = op.inSwitch("Algorithm", algorithms, 'Default');
const inSamples = op.inSwitch("Samples", [1, 2, 4, 8], 4);
const inSpread = op.inInt("Sample Spread", 250);

inSamples.setUiAttribs({ greyout: true });
inSpread.setUiAttribs({ greyout: true });

if (inReceiveShadow.get()) {
    if (inAlgorithm.get() === "PCF" || inAlgorithm.get() === "Poisson") {
        inSamples.setUiAttribs({ greyout: false });
        inSpread.setUiAttribs({ greyout: false });
    }
    else if (inAlgorithm.get() === "VSM" || inAlgorithm.get() === "Default") {
        inSamples.setUiAttribs({ greyout: true });
        inSpread.setUiAttribs({ greyout: true });
    }
}

op.setPortGroup("", [inCastShadow, inReceiveShadow]);
op.setPortGroup("Shadow Settings", [inAlgorithm, inSamples, inSpread]);

inReceiveShadow.onChange = () => {
    inAlgorithm.setUiAttribs({ greyout: !inReceiveShadow.get() });
    setAlgorithmGreyouts();
    if (shader) shader.toggleDefine("SHADOW_MAP", inReceiveShadow.get());
}

inAlgorithm.onChange = () => {
    if (!shader) return;
    const selectedAlgorithm = inAlgorithm.get();
    shader.define("MODE_" + selectedAlgorithm.toUpperCase());

    algorithms
        .filter(alg => alg !== selectedAlgorithm)
        .forEach(alg => shader.removeDefine("MODE_" + alg.toUpperCase()));

    setAlgorithmGreyouts();
}

function setAlgorithmGreyouts() {
    if (!inReceiveShadow.get()) {
        inSamples.setUiAttribs({ greyout: true });
        inSpread.setUiAttribs({ greyout: true });
        return;
    }

    if (inAlgorithm.get() === "PCF" || inAlgorithm.get() === "Poisson") {
        inSamples.setUiAttribs({ greyout: false });
        inSpread.setUiAttribs({ greyout: false });
    } else {
        inSamples.setUiAttribs({ greyout: true });
        inSpread.setUiAttribs({ greyout: true });
    }
}

inSamples.onChange = () => {
    if (shader) shader.define("SAMPLE_AMOUNT", "float(" + clamp(Number(inSamples.get()), 1, 16).toString() + ")");
}

const outTrigger = op.outTrigger("Trigger Out");


const createVertexHead = (n, type) => {
    if (type === "ambient") return "";
    if (type === "point") return attachments.shadow_head_point_vert.replace(LIGHT_INDEX_REGEX, n);
    if (type === "spot") return attachments.shadow_head_spot_vert.replace(LIGHT_INDEX_REGEX, n);
    if (type === "directional") return attachments.shadow_head_directional_vert.replace(LIGHT_INDEX_REGEX, n);
};

const createVertexBody = (n, type) => {
    if (type === "ambient") return "";
    if (type === "point") return attachments.shadow_body_point_vert.replace(LIGHT_INDEX_REGEX, n);
    if (type === "spot") return attachments.shadow_body_spot_vert.replace(LIGHT_INDEX_REGEX, n);
    if (type === "directional") return attachments.shadow_body_directional_vert.replace(LIGHT_INDEX_REGEX, n);
};

const createFragmentHead = (n, type) => {
    if (type === "ambient") return "";
    if (type === "point") return attachments.shadow_head_point_frag.replace(LIGHT_INDEX_REGEX, n);
    if (type === "spot") return attachments.shadow_head_spot_frag.replace(LIGHT_INDEX_REGEX, n);
    if (type === "directional") return attachments.shadow_head_directional_frag.replace(LIGHT_INDEX_REGEX, n);
};

const createFragmentBody = (n, type) => {
    if (type === "ambient") return '';
    let fragmentCode = "";
    // if (inReceiveShadow.get()) {
        if (type === "spot") {
            fragmentCode = fragmentCode.concat(attachments.shadow_body_spot_frag.replace(LIGHT_INDEX_REGEX, n));
        }
        else if (type === "directional") {
    fragmentCode = fragmentCode.concat(attachments.shadow_body_directional_frag.replace(LIGHT_INDEX_REGEX, n));
        } else if (type === "point") {
            fragmentCode = fragmentCode.concat(attachments.shadow_body_point_frag.replace(LIGHT_INDEX_REGEX, n));
        }
    // }

    return fragmentCode;
};

let lastLength = 0;

function createModuleShaders(lightStack) {
    if (lightStack.length === lastLength) return;
        let vertexHead = "";
        let fragmentHead = "";
        let vertexBody = "";
        let fragmentBody = "";

    for (let i = 0; i < lightStack.length; i += 1) {
        const light = lightStack[i];
        vertexHead = vertexHead.concat(createVertexHead(i, light.type));
        vertexBody = vertexBody.concat(createVertexBody(i, light.type));

        fragmentHead = fragmentHead.concat(createFragmentHead(i, light.type));
        fragmentBody = fragmentBody.concat(createFragmentBody(i, light.type, light.castShadow));
    }

    srcHeadVert = srcHeadVertBase.concat(vertexHead);
    srcBodyVert = srcBodyVertBase.concat(vertexBody);
    srcHeadFrag = srcHeadFragBase.concat(fragmentHead);
    srcBodyFrag = srcBodyFragBase.concat(fragmentBody);

    lastLength = lightStack.length;
    createUniforms(lastLength);
}


let shader = null;
let vertexModule = null;
let fragmentModule = null;

const srcHeadVertBase = attachments.head_vert;
const srcBodyVertBase = "";
const srcHeadFragBase = attachments.head_frag;
const srcBodyFragBase = "";

let srcHeadVert = srcHeadVertBase;
let srcBodyVert = srcBodyVertBase;
let srcHeadFrag = srcHeadFragBase;
let srcBodyFrag = srcBodyFragBase;

let lightUniforms = [];
let uniformSpread = null;
function createUniforms(lightsCount) {
    if (!shader) return;
    lightUniforms = [];

    for (let i = 0; i < lightsCount; i += 1) {
        lightUniforms[i] = null;
        if (!lightUniforms[i]) {
            lightUniforms[i] = {
                position: new CGL.Uniform(shader,'3f','light' + i + '.position',[0, 0, 0]),
                typeCastShadow: new CGL.Uniform(shader, '2i', 'light' + i + '.typeCastShadow', [0, 0]),

                shadowProperties: new CGL.Uniform(shader, '4f', 'light' + i + '.shadowProperties', [0,0,0,0]),
                shadowStrength: new CGL.Uniform(shader, 'f', 'light' + i + '.shadowStrength', 1),

                shadowMap: null,

                // vertex shader
                normalOffset:  new CGL.Uniform(shader, 'f', 'normalOffset' + i, 0),
                lightMatrix:  new CGL.Uniform(shader,'m4', 'lightMatrix' + i, mat4.create()),
            };
        }
    }
    if (!uniformSpread) uniformSpread = new CGL.Uniform(shader, 'f', "sampleSpread", inSpread);
}

function setUniforms(lightStack) {
    const receiveShadow = inReceiveShadow.get();
    let castShadow = false;

    for (let i = 0; i < lightStack.length; i += 1) {
        const light = lightStack[i];
        if (light.type === "ambient") continue;
        lightUniforms[i].position.setValue([
            light.position[0],
            light.position[1],
            light.position[2],
        ]);
        lightUniforms[i].typeCastShadow.setValue([
            LIGHT_TYPES[light.type],
            light.castShadow,
        ]);

        if (light.shadowMap) {
            lightUniforms[i].lightMatrix.setValue(light.lightMatrix);
            lightUniforms[i].normalOffset.setValue(light.normalOffset);
            lightUniforms[i].shadowProperties.setValue([
                light.nearFar[0],
                light.nearFar[1],
                light.shadowMap.width,
                light.shadowBias
            ]);
            lightUniforms[i].shadowStrength.setValue(light.shadowStrength);

            if (!lightUniforms[i].shadowMap) {
                lightUniforms[i].shadowMap = new CGL.Uniform(shader, 't', 'shadowMap' + i, i);
            }
            shader.pushTexture(lightUniforms[i].shadowMap, light.shadowMap.tex);
        } else if (light.shadowCubeMap) {
             lightUniforms[i].shadowProperties.setValue([
                light.nearFar[0],
                light.nearFar[1],
                light.shadowCubeMap.width,
                light.shadowBias
            ]);

            lightUniforms[i].shadowStrength.setValue(light.shadowStrength);

            if (!lightUniforms[i].shadowMap) {
                lightUniforms[i].shadowMap = new CGL.Uniform(shader, 't', 'shadowMap' + i, i);
            }

            shader.pushTexture(lightUniforms[i].shadowMap, light.shadowCubeMap.cubemap, cgl.gl.TEXTURE_CUBE_MAP);
        } else {
            if (lightUniforms[i].shadowMap) lightUniforms[i].shadowMap = null;
            if (lightUniforms[i].shadowCubeMap) lightUniforms[i].shadowMap = null;
        }
        castShadow = castShadow || light.castShadow;
        if (receiveShadow && castShadow) {
            if(!shader.hasDefine("SHADOW_MAP")) shader.define("SHADOW_MAP");
        }
        else {
            if (!shader.hasDefine("SHADOW_MAP")) shader.removeDefine("SHADOW_MAP");
        }
    }

}


function updateShader() {
    const currentShader = cgl.getShader();

    if (currentShader && currentShader != shader || cgl.frameStore.lightStack.length !== lastLength) {

        removeModulesAndDefines();
        shader = currentShader;
        createModuleShaders(cgl.frameStore.lightStack);
        if (!shader.hasDefine("SHADOW_MAP")) {
            vertexModule = shader.addModule({
                name: 'MODULE_VERTEX_POSITION',
                title: op.objName,
                priority:-2,
                srcHeadVert: srcHeadVert,
                srcBodyVert: srcBodyVert
            });

            fragmentModule = shader.addModule({
                name: "MODULE_COLOR",
                priority: -2,
                title: op.objName,
                srcHeadFrag:srcHeadFrag,
                srcBodyFrag:srcBodyFrag,
            }, vertexModule);
            shader.define("SHADOW_MAP");
            shader.define("MODE_" + inAlgorithm.get().toUpperCase());
            shader.define("SAMPLE_AMOUNT", "float(" + clamp(Number(inSamples.get()), 1, 16).toString() + ")");
        }
    }

    if (shader) {
        setUniforms(cgl.frameStore.lightStack);
    }
}

function removeModulesAndDefines() {
    if(shader && vertexModule) {
        shader.removeDefine('SHADOW_MAP');
        shader.removeDefine("MODE_" + inAlgorithm.get().toUpperCase());
        shader.removeModule(vertexModule);
        shader.removeModule(fragmentModule);
        shader = null;
    }
}
inTrigger.onLinkChanged = function() {
    if (!inTrigger.isLinked()) {
        removeModulesAndDefines();
        lastLength = 0;
    }
}

inTrigger.onTriggered = () => {
    if (!inCastShadow.get()) {
        if (!cgl.frameStore.shadowPass) {
            updateShader();
            outTrigger.trigger();
        }
        return;
    }

    if (!inReceiveShadow.get()) {
        outTrigger.trigger();
        return;
    }

    if (cgl.frameStore.shadowPass) {
        outTrigger.trigger();
        return;
    }

    if (!cgl.frameStore.lightStack) {
        outTrigger.trigger();
        return;
    }

    updateShader();
    outTrigger.trigger();
}
