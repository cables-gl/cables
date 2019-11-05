
function Light(config) {
     this.type = config.type || "directional";
     this.color = config.color || [1, 1, 1];
     this.specular = config.specular || [0, 0, 0];
     this.position = config.position || null;
     this.intensity = config.intensity || 1;
     this.constantAttenuation = config.constantAttenuation || 0;
     this.linearAttenuation = config.linearAttenuation || 0;
     this.quadraticAttenuation = config.quadraticAttenuation || 0;
     this.spotExponent = config.spotExponent || 1;
     this.cosConeAngleInner = Math.cos(CGL.DEG2RAD*config.coneAngleInner) || 0; // spot light
     this.coneAngleInner = config.coneAngleInner;
     this.coneAngle = config.coneAngle || 0; // spot light
     this.cosConeAngle = config.cosConeAngle || 0;
     this.conePointAt = config.conePointAt || [0, 0, 0];
     return this;
}


const inTrigger = op.inTrigger("Trigger In");
const inPosX = op.inFloat("X", -1);
const inPosY = op.inFloat("Y", 1);
const inPosZ = op.inFloat("Z", 1);

const positionIn = [inPosX, inPosY, inPosZ];
op.setPortGroup("Direction", positionIn);

const inR = op.inFloat("R", 1);
const inG = op.inFloat("G", 1);
const inB = op.inFloat("B", 1);

inR.setUiAttribs({ colorPick: true });
const colorIn = [inR, inG, inB];
op.setPortGroup("Color", colorIn);

const inSpecularR = op.inFloat("Specular R", 0.1);
const inSpecularG = op.inFloat("Specular G", 0.1);
const inSpecularB = op.inFloat("Specular B", 0.1);

inSpecularR.setUiAttribs({ colorPick: true });
const colorSpecularIn = [inSpecularR, inSpecularG, inSpecularB];
op.setPortGroup("Specular Color", colorSpecularIn);

const inIntensity = op.inFloatSlider("Intensity", 1);
const inRadius = op.inFloat("Radius", 30);
const inFalloff = op.inFloat("Falloff", 10);
const attribIns = [inIntensity, inRadius, inFalloff];
op.setPortGroup("Light Attributes", attribIns);

const outTrigger = op.outTrigger("Trigger Out");

const light = new Light({
    type: "directional",
    position: [0, 1, 2].map(function(i){ return positionIn[i].get() }),
    color: [0 , 1, 2].map(function(i) { return colorIn[i].get() }),
    specular: [0 , 1, 2].map(function(i) { return colorSpecularIn[i].get() }),
    intensity: inIntensity.get(),
    radius: inRadius.get(),
    falloff: inFalloff.get()
});

const inLight = {
  position: [inPosX, inPosY, inPosZ],
  color: [inR, inG, inB],
  specular: [inSpecularR, inSpecularG, inSpecularB],
  intensity: inIntensity,
  radius: inRadius,
  falloff: inFalloff
};

Object.keys(inLight).forEach(function(key) {
    if (inLight[key].length) {
        for (let i = 0; i < inLight[key].length; i += 1) {
            inLight[key][i].onChange = function() {
                light[key][i] = inLight[key][i].get();
            }
        }
    } else {
        inLight[key].onChange = function() {
            light[key] = inLight[key].get();
        }
    }
});

const cgl = op.patch.cgl;

inTrigger.onTriggered = function() {
    if (!cgl.lightStack) cgl.lightStack = [];

    // TODO: add directional vector gizmo

    cgl.lightStack.push(light);
    outTrigger.trigger();
    cgl.lightStack.pop();
}