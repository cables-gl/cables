
function Light(config) {
     this.type = config.type || "point";
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



// * OP START *
const inTrigger = op.inTrigger("Trigger In");

const inPosX = op.inFloat("X", 2.5);
const inPosY = op.inFloat("Y", 2);
const inPosZ = op.inFloat("Z", 1);

const positionIn = [inPosX, inPosY, inPosZ];
op.setPortGroup("Position", positionIn);

const inPointAtX = op.inFloat("Point At X", 0);
const inPointAtY = op.inFloat("Point At Y", 0);
const inPointAtZ = op.inFloat("Point At Z", 0);
const pointAtIn = [inPointAtX, inPointAtY, inPointAtZ];
op.setPortGroup("Point At", pointAtIn);

const inR = op.inFloatSlider("R", 1);
const inG = op.inFloatSlider("G", 1);
const inB = op.inFloatSlider("B", 1);
inR.setUiAttribs({ colorPick: true });
const colorIn = [inR, inG, inB];
op.setPortGroup("Color", colorIn);

const inSpecularR = op.inFloatSlider("Specular R", 1);
const inSpecularG = op.inFloatSlider("Specular G", 1);
const inSpecularB = op.inFloatSlider("Specular B", 1);
inSpecularR.setUiAttribs({ colorPick: true });
const colorSpecularIn = [inSpecularR, inSpecularG, inSpecularB];
op.setPortGroup("Specular Color", colorSpecularIn);

const inConeAngle = op.inFloat("Cone Angle", 130);
const inConeAngleInner = op.inFloat("Inner Cone Angle", 60);
const inSpotExponent = op.inFloat("Spot Exponent", 0.97);
const coneAttribsIn = [inConeAngle, inConeAngleInner, inSpotExponent];
op.setPortGroup("Cone Attributes", coneAttribsIn);

const inIntensity = op.inFloatSlider("Intensity", 1);
const inRadius = op.inFloat("Radius", 10);
const inFalloff = op.inFloat("Falloff", 3);
const inConstantAttenuation = op.inFloatSlider("Constant Attenuation", 0.234);
const inLinearAttenuation = op.inFloatSlider("Linear Attenuation", 0.077);
const inQuadraticAttenuation = op.inFloatSlider("Quadratic Attenuation", 0.098);
const lightAttribsIn = [inIntensity, inRadius, inFalloff, inConstantAttenuation, inLinearAttenuation, inQuadraticAttenuation];
op.setPortGroup("Light Attributes", lightAttribsIn);

const outTrigger = op.outTrigger("Trigger Out");
const outArr = op.outArray("Arrow Out");
const inLight = {
  position: positionIn,
  conePointAt: pointAtIn,
  color: colorIn,
  specular: colorSpecularIn,
  intensity: inIntensity,
  constantAttenuation: inConstantAttenuation,
  linearAttenuation: inLinearAttenuation,
  quadraticAttenuation: inQuadraticAttenuation,
  coneAngle: inConeAngle,
  cosConeAngle: inConeAngle,
  coneAngleInner: inConeAngleInner,
  cosConeAngleInner: inConeAngleInner,
  spotExponent: inSpotExponent
};

const cgl = op.patch.cgl;

const light = new Light({
    type: "spot",
    position: [0, 1, 2].map(function(i){ return positionIn[i].get() }),
    color: [0 , 1, 2].map(function(i) { return colorIn[i].get() }),
    specular: [0 , 1, 2].map(function(i) { return colorSpecularIn[i].get() }),
    pointAt: [0, 1, 2].map(function(i) { return pointAtIn[i].get() }),
    intensity: inIntensity.get(),
    constantAttenuation: inConstantAttenuation.get(),
    linearAttenuation: inLinearAttenuation.get(),
    quadraticAttenuation: inLinearAttenuation.get(),
    cosConeAngleInner: Math.cos(CGL.DEG2RAD * inConeAngleInner.get()),
    coneAngle: CGL.DEG2RAD * inConeAngle.get(),
    cosConeAngle: Math.cos(CGL.DEG2RAD * inConeAngle.get()),
    coneAngleInner: CGL.DEG2RAD * inConeAngleInner.get(),
    spotExponent: inSpotExponent.get()
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
            if (key === "coneAngle" || key === "coneAngleInner" || key === "coneAngleOuter") {
                light[key] = CGL.DEG2RAD*inLight[key].get();
            } else if (key === "cosConeAngle" || key === "cosConeAngleInner"){
                light[key] = Math.cos(CGL.DEG2RAD*inLight[key].get());
            }
            else light[key] = inLight[key].get();
        }
    }
});


inTrigger.onTriggered = function() {
    if (!cgl.frameStore.lightStack) cgl.frameStore.lightStack = [];

    if(op.patch.isEditorMode() && (CABLES.UI.renderHelper || gui.patch().isCurrentOp(op))) {
        gui.setTransformGizmo({
            posX:inPosX,
            posY:inPosY,
            posZ:inPosZ,
        });
        CABLES.GL_MARKER.drawLineSourceDest({
            op: op,
            sourceX: inPosX.get(),
            sourceY: inPosY.get(),
            sourceZ: inPosZ.get(),
            destX: inPointAtX.get(),
            destY: inPointAtY.get(),
            destZ: inPointAtZ.get(),
        })
    }
    cgl.frameStore.lightStack.push(light);
    outArr.set(null);
    outArr.set([inPosX.get(), inPosY.get(), inPosZ.get(), inPointAtX.get(), inPointAtY.get(), inPointAtZ.get()]);
    outTrigger.trigger();
    cgl.frameStore.lightStack.pop();
}


