const cgl = op.patch.cgl;

const inTrigger = op.inTrigger("Trigger In");

const inPosX = op.inFloat("X", 0);
const inPosY = op.inFloat("Y", 2);
const inPosZ = op.inFloat("Z", 0);
const positionIn = [inPosX, inPosY, inPosZ];
op.setPortGroup("Position", positionIn);

const inPointAtX = op.inFloat("Point At X", 0);
const inPointAtY = op.inFloat("Point At Y", 0);
const inPointAtZ = op.inFloat("Point At Z", 0);
const pointAtIn = [inPointAtX, inPointAtY, inPointAtZ];
op.setPortGroup("Point At", pointAtIn);

const inRightX = op.inFloat("Right X", 0);
const inRightY = op.inFloat("Right Y", 1);
const inRightZ = op.inFloat("Right Z", 0);
const rightIn = [inRightX, inRightY, inRightZ];
op.setPortGroup("Right", rightIn);

const inIntensity = op.inFloat("Intensity", 1);
const inFalloff = op.inFloat("Falloff", 0);
const inWidth = op.inFloat("Width", 2);
const inHeight = op.inFloat("Height", 2);
op.setPortGroup("Light Properties", [inIntensity, inFalloff, inWidth, inHeight]);

const inR = op.inFloatSlider("R", 1);
const inG = op.inFloatSlider("G", 1);
const inB = op.inFloatSlider("B", 1);
const colorIn = [inR, inG, inB];
op.setPortGroup("Color", colorIn);
inR.setUiAttribs({ colorPick: true });

const inSpecularR = op.inFloatSlider("Specular R", 0.8);
const inSpecularG = op.inFloatSlider("Specular G", 0.8);
const inSpecularB = op.inFloatSlider("Specular B", 0.8);
const colorSpecularIn = [inSpecularR, inSpecularG, inSpecularB];
op.setPortGroup("Specular Color", colorSpecularIn);
inSpecularR.setUiAttribs({ colorPick: true });


inR.onChange = inG.onChange = inB.onChange = inSpecularR.onChange = inSpecularG.onChange = inSpecularB.onChange
= inPointAtX.onChange = inPointAtY.onChange = inPointAtZ.onChange = inRightX.onChange = inRightY.onChange = inRightZ.onChange
= inPosX.onChange = inPosY.onChange = inPosZ.onChange
= inIntensity.onChange = inFalloff.onChange =  updateLightParameters;

let updateLight = false;

function updateLightParameters() { updateLight = true; }


const outTrigger = op.outTrigger("Trigger Out");

const light = new CGL.Light(cgl, {
   type: "area",
   position: [inPosX.get(), inPosY.get(), inPosZ.get()],
   conePointAt: [inPointAtX.get(), inPointAtY.get(), inPointAtZ.get()],
   right: [inRightX.get(), inRightY.get(), inRightZ.get()],

   color: [inR.get(), inG.get(), inB.get()],
   specular: [inSpecularR.get(), inSpecularG.get(), inSpecularB.get()],

   width: inWidth.get(),
   height: inHeight.get(),
   falloff: inFalloff.get(),
});

function drawHelpers() {
    if (cgl.frameStore.shadowPass) return;
    if (op.patch.isEditorMode() && (CABLES.UI.renderHelper || op.isCurrentUiOp())) {
        gui.setTransformGizmo({
            "posX": inPosX,
            "posY": inPosY,
            "posZ": inPosZ,
        });
    }
}

inTrigger.onTriggered = () => {
    if (!cgl.frameStore.lightStack) cgl.frameStore.lightStack = [];
    if (updateLight) {
        light.position = [0, 1, 2].map(function (i) { return positionIn[i].get(); });
        light.color = [0, 1, 2].map(function (i) { return colorIn[i].get(); });
        light.specular = [0, 1, 2].map(function (i) { return colorSpecularIn[i].get(); });
        light.conePointAt = [0, 1, 2].map(function (i) { return pointAtIn[i].get(); });
        light.right = [0, 1, 2].map(function (i) { return rightIn[i].get(); });

        light.intensity = inIntensity.get();
        light.falloff = inFalloff.get();
        light.width = inWidth.get();
        light.height = inHeight.get();
        updateLight = false;
    }

    drawHelpers();
    cgl.frameStore.lightStack.push(light);
    outTrigger.trigger();
    cgl.frameStore.lightStack.pop();
}