
function Light(config) {
     this.type = config.type || "point";
     this.color = config.color || [1, 1, 1];
     this.specular = config.specular || [0, 0, 0];
     this.position = config.position || null;
     this.intensity = config.intensity || 1;
     this.radius = config.radius || 1;
     this.falloff = config.falloff || 1;
     this.spotExponent = config.spotExponent || 1;
     this.cosConeAngleInner = config.cosConeAngleInner || 0; // spot light
     this.cosConeAngle = config.cosConeAngle || 0;
     this.conePointAt = config.conePointAt || [0, 0, 0];
     return this;
}



// * OP START *
const inTrigger = op.inTrigger("Trigger In");

const inIntensity = op.inFloat("Intensity", 5);
const inRadius = op.inFloat("Radius", 10);

const inPosX = op.inFloat("X", 1);
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

const inFalloff = op.inFloatSlider("Falloff", 0.00001);
const lightAttribsIn = [inIntensity, inRadius ];
op.setPortGroup("Light Attributes", lightAttribsIn);


const outTrigger = op.outTrigger("Trigger Out");

const inLight = {
  position: positionIn,
  conePointAt: pointAtIn,
  color: colorIn,
  specular: colorSpecularIn,
  intensity: inIntensity,
  radius: inRadius,
  falloff: inFalloff,
  cosConeAngle: inConeAngle,
  cosConeAngleInner: inConeAngleInner,
  spotExponent: inSpotExponent
};

const cgl = op.patch.cgl;

const light = new Light({
    type: "spot",
    position: [0, 1, 2].map(function(i){ return positionIn[i].get() }),
    color: [0 , 1, 2].map(function(i) { return colorIn[i].get() }),
    specular: [0 , 1, 2].map(function(i) { return colorSpecularIn[i].get() }),
    conePointAt: [0, 1, 2].map(function(i) { return pointAtIn[i].get() }),
    intensity: inIntensity.get(),
    radius: inRadius.get(),
    falloff: inFalloff.get(),
    cosConeAngleInner: Math.cos(CGL.DEG2RAD * inConeAngleInner.get()),
    cosConeAngle: Math.cos(CGL.DEG2RAD * inConeAngle.get()),
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
        if (inLight[key]) {
        inLight[key].onChange = function() {
            if (key === "coneAngle" || key === "coneAngleInner" || key === "coneAngleOuter") {
                light[key] = CGL.DEG2RAD*inLight[key].get();
            } else if (key === "cosConeAngle") {
                light[key] = Math.cos(CGL.DEG2RAD*(inLight[key].get()));

            }
            else if (key === "cosConeAngleInner") {
                light[key] = Math.cos(CGL.DEG2RAD*(inLight[key].get()));
            }
            else light[key] = inLight[key].get();
        }
    }
    }
});

const position = vec3.create();
const pointAtPos = vec3.create();
const resultPos = vec3.create();
const resultPointAt = vec3.create();

inTrigger.onTriggered = function() {
    if (!cgl.lightStack) cgl.lightStack = [];

    vec3.set(position, inPosX.get(), inPosY.get(), inPosZ.get());
    vec3.set(pointAtPos, inPointAtX.get(), inPointAtY.get(), inPointAtZ.get());

    vec3.transformMat4(resultPos, position, cgl.mMatrix);
    vec3.transformMat4(resultPointAt, pointAtPos, cgl.mMatrix);

    light.position = resultPos;
    light.conePointAt = resultPointAt;

    if(op.patch.isEditorMode() && (CABLES.UI.renderHelper || gui.patch().isCurrentOp(op))) {
        gui.setTransformGizmo({
            posX:inPosX,
            posY:inPosY,
            posZ:inPosZ,
        });
        CABLES.GL_MARKER.drawLineSourceDest({
            op: op,
            sourceX: light.position[0],
            sourceY: light.position[1],
            sourceZ: light.position[2],
            destX: light.conePointAt[0],
            destY: light.conePointAt[1],
            destZ: light.conePointAt[2],
        })
    }

    cgl.lightStack.push(light);

    outTrigger.trigger();
    cgl.lightStack.pop();
}


