
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

Light.prototype.updateColor = () => {
    this.color = [0,1,2].map((_, i) => colorIn[i].get());
}

Light.prototype.updateColor = () => {
    this.color = [0,1,2].map((_, i) => colorIn[i].get());
}


Light.prototype.update = function(keys, ports) {
    if (keys)
        keys.forEach(key => {
            if (key === "color") {
                this.updateColor();
                return;
            }
            if (key === "position") {
                this.updatePosition();
            }
            this[key] = ports[key].get();
        });
}


// * OP START *
const inTrigger = op.inTrigger("Trigger In");

const inPosX = op.inFloat("X", 0);
const inPosY = op.inFloat("Y", 1);
const inPosZ = op.inFloat("Z", 0.75);

const positionIn = [inPosX, inPosY, inPosZ];
op.setPortGroup("Position", positionIn);

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
const inRadius = op.inFloat("Radius", 10);
const inFalloff = op.inFloatSlider("Falloff", 0.8);
const inConstantAttenuation = op.inFloatSlider("Constant Attenuation", 0.894);
const inLinearAttenuation = op.inFloatSlider("Linear Attenuation", 0.378);
const inQuadraticAttenuation = op.inFloatSlider("Quadratic Attenuation", 0.266);
const attribIns = [inIntensity, inRadius, inFalloff, inConstantAttenuation, inLinearAttenuation, inQuadraticAttenuation];
op.setPortGroup("Light Attributes", attribIns);

const outTrigger = op.outTrigger("Trigger Out");

const inLight = {
  position: [inPosX, inPosY, inPosZ],
  color: [inR, inG, inB],
  specular: [inSpecularR, inSpecularG, inSpecularB],
  intensity: inIntensity,
  constantAttenuation: inConstantAttenuation,
  linearAttenuation: inLinearAttenuation,
  quadraticAttenuation: inQuadraticAttenuation,
  radius: inRadius,
  falloff: inFalloff,
};

const cgl = op.patch.cgl;

const light = new Light({
    type: "point",
    position: [0, 1, 2].map(function(i){ return positionIn[i].get() }),
    color: [0 , 1, 2].map(function(i) { return colorIn[i].get() }),
    specular: [0 , 1, 2].map(function(i) { return colorSpecularIn[i].get() }),
    intensity: inIntensity.get(),
    constantAttenuation: inConstantAttenuation.get(),
    linearAttenuation: inLinearAttenuation.get(),
    quadraticAttenuation: inLinearAttenuation.get(),
    radius: inRadius.get(),
    falloff: inFalloff.get(),
});

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

    if(CABLES.UI && gui.patch().isCurrentOp(op)) {
        gui.setTransformGizmo({
            posX:inPosX,
            posY:inPosY,
            posZ:inPosZ,
        });


    }
    cgl.lightStack.push(light);
    outTrigger.trigger();
    cgl.lightStack.pop();
}


