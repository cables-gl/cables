const inTrigger = op.inTrigger("Trigger In");
const inR = op.inValueSlider("R", 0.1);
inR.setUiAttribs({ colorPick: true });
const inG = op.inValueSlider("G", 0.1);
const inB = op.inValueSlider("B", 0.1);
const inIntensity = op.inValueSlider("Intensity", 1);
const colorIn = [inR, inG, inB];
op.setPortGroup("Color", colorIn);

const outTrigger = op.outTrigger("Trigger Out");
// your new op
// have a look at the documentation at:
// https://docs.cables.gl/dev_hello_op/dev_hello_op.html

function Light(config) {
     this.type = config.type || "point";
     this.color = config.color || [1, 1, 1];
     this.specular = config.specular || [0, 0, 0];
     this.position = config.position || null;
     this.intensity = config.intensity || 1;
     this.constantAttenuation = config.constantAttenuation || 0;
     this.linearAttenuation = config.linearAttenuation || 0;
     this.quadraticAttenuation = config.quadraticAttenuation || 0;
     this.radius = config.radius || 1;
     this.falloff = config.falloff || 1;
     this.spotExponent = config.spotExponent || 1;
     this.coneAngleInner = config.coneAngleInner || 0; // spot light
     this.coneAngle = config.coneAngle || 0; // spot light
     this.cosConeAngle = Math.cos(CGL.DEG2RAD * this.coneAngle);
     this.conePointAt = config.conePointAt || [0, 0, 0];
     return this;
}

const cgl = op.patch.cgl;

const light = new Light({
    type: "ambient",
    color: [0 , 1, 2].map(function(i) { return colorIn[i].get() }),
    intensity: inIntensity.get(),
});

const inLight = {
  color: [inR, inG, inB],
  intensity: inIntensity,
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


inTrigger.onTriggered = function() {
    if (!cgl.lightStack) cgl.lightStack = [];


    cgl.lightStack.push(light);
    outTrigger.trigger();
    cgl.lightStack.pop();
}
