
function Light(config)
{
    this.type = config.type || "directional";
    this.color = config.color || [1, 1, 1];
    this.specular = config.specular || [0, 0, 0];
    this.position = config.position || null;
    this.intensity = config.intensity || 1;
    this.spotExponent = config.spotExponent || 1;
    this.cosConeAngleInner = Math.cos(CGL.DEG2RAD * config.coneAngleInner) || 0; // spot light
    this.coneAngleInner = config.coneAngleInner;
    this.coneAngle = config.coneAngle || 0; // spot light
    this.cosConeAngle = config.cosConeAngle || 0;
    this.conePointAt = config.conePointAt || [0, 0, 0];
    return this;
}


const inTrigger = op.inTrigger("Trigger In");
const inPosX = op.inFloat("X", 0);
const inPosY = op.inFloat("Y", 3);
const inPosZ = op.inFloat("Z", 5);

const positionIn = [inPosX, inPosY, inPosZ];
op.setPortGroup("Direction", positionIn);

const inR = op.inFloat("R", 1);
const inG = op.inFloat("G", 1);
const inB = op.inFloat("B", 1);

inR.setUiAttribs({ "colorPick": true });
const colorIn = [inR, inG, inB];
op.setPortGroup("Color", colorIn);

const inSpecularR = op.inFloat("Specular R", 0.2);
const inSpecularG = op.inFloat("Specular G", 0.2);
const inSpecularB = op.inFloat("Specular B", 0.2);

inSpecularR.setUiAttribs({ "colorPick": true });
const colorSpecularIn = [inSpecularR, inSpecularG, inSpecularB];
op.setPortGroup("Specular Color", colorSpecularIn);

const inIntensity = op.inFloat("Intensity", 1);
const attribIns = [inIntensity];
op.setPortGroup("Light Attributes", attribIns);

const outTrigger = op.outTrigger("Trigger Out");

const light = new Light({
    "type": "directional",
    "position": [0, 1, 2].map(function (i) { return positionIn[i].get(); }),
    "color": [0, 1, 2].map(function (i) { return colorIn[i].get(); }),
    "specular": [0, 1, 2].map(function (i) { return colorSpecularIn[i].get(); }),
    "intensity": inIntensity.get(),
    "radius": null,
    "falloff": null,
});

const inLight = {
    "position": [inPosX, inPosY, inPosZ],
    "color": [inR, inG, inB],
    "specular": [inSpecularR, inSpecularG, inSpecularB],
    "intensity": inIntensity,
};

Object.keys(inLight).forEach(function (key)
{
    if (inLight[key].length)
    {
        for (let i = 0; i < inLight[key].length; i += 1)
        {
            inLight[key][i].onChange = function ()
            {
                light[key][i] = inLight[key][i].get();
            };
        }
    }
    else
    {
        inLight[key].onChange = function ()
        {
            light[key] = inLight[key].get();
        };
    }
});

const cgl = op.patch.cgl;

const result = vec3.create();
const position = vec3.create();

inTrigger.onTriggered = function ()
{
    if (!cgl.tempData.lightStack) cgl.tempData.lightStack = [];

    // vec3.set(position, inPosX.get(), inPosY.get(), inPosZ.get());
    // vec3.transformMat4(result, position, cgl.mMatrix);
    //  light.position = result;

    if (cgl.shouldDrawHelpers(op))

    {
        CABLES.GL_MARKER.drawLineSourceDest(
            op,
            -200 * light.position[0],
            -200 * light.position[1],
            -200 * light.position[2],
            200 * light.position[0],
            200 * light.position[1],
            200 * light.position[2],
        );
    }


    cgl.tempData.lightStack.push(light);
    outTrigger.trigger();
    cgl.tempData.lightStack.pop();
};
