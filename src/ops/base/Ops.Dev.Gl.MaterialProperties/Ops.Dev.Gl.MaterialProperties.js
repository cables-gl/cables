// Overrides material properties of the active shader for all child ops.

const
    exec = op.inTrigger("Trigger"),

    inSetColor = op.inBool("Set Color", true),
    r = op.inFloatSlider("r", Math.random()),
    g = op.inFloatSlider("g", Math.random()),
    b = op.inFloatSlider("b", Math.random()),
    a = op.inFloatSlider("a", 1),

    inSetRoughness = op.inBool("Set Roughness", false),
    inRoughness = op.inFloatSlider("Roughness", 0.5),
    inSetMetalness = op.inBool("Set Metalness", false),
    inMetalness = op.inFloatSlider("Metalness", 0),
    inSetUnlit = op.inBool("Set Unlit", false),
    inUnlit = op.inBool("Unlit", false),

    inSetTexTrans = op.inBool("Set Tex Transform", false),
    inRepeatX = op.inFloat("Repeat X", 1),
    inRepeatY = op.inFloat("Repeat Y", 1),
    inOffsetX = op.inFloat("Offset X", 0),
    inOffsetY = op.inFloat("Offset Y", 0),

    inTexDiffuse = op.inTexture("Diffuse Texture"),
    inTexNormal = op.inTexture("Normal Texture"),
    inTexMetalRough = op.inTexture("Metal/Roughness Texture"),
    inTexOcclusion = op.inTexture("Occlusion Texture"),
    inTexLightmap = op.inTexture("Lightmap Texture"),
    inTexEmission = op.inTexture("Emission Texture"),

    next = op.outTrigger("Next"),
    outSupported = op.outString("Supported Properties");

r.setUiAttribs({ "colorPick": true });

op.setPortGroup("Color", [inSetColor, r, g, b, a]);
op.setPortGroup("PBR", [inSetRoughness, inRoughness, inSetMetalness, inMetalness, inSetUnlit, inUnlit]);
op.setPortGroup("Texture Transform", [inSetTexTrans, inRepeatX, inRepeatY, inOffsetX, inOffsetY]);
op.setPortGroup("Textures", [inTexDiffuse, inTexNormal, inTexMetalRough, inTexOcclusion, inTexLightmap, inTexEmission]);

// property of materialPropUniforms -> its ports. value properties start with their "Set ..." toggle
const valueProps = {
    "diffuseColor": [inSetColor, r, g, b, a],
    "pbrRoughness": [inSetRoughness, inRoughness],
    "pbrMetalness": [inSetMetalness, inMetalness],
    "unlit": [inSetUnlit, inUnlit],
    "texTransform": [inSetTexTrans, inRepeatX, inRepeatY, inOffsetX, inOffsetY],
};

const texProps = {
    "diffuseTexture": inTexDiffuse,
    "normalTexture": inTexNormal,
    "metalRoughnessTexture": inTexMetalRough,
    "occlusionTexture": inTexOcclusion,
    "lightmapTexture": inTexLightmap,
    "emissionTexture": inTexEmission,
};

let currentProps = null; // materialPropUniforms of the last rendered shader, null as long as unknown
let lastSupported = null;
let lastWarning = null;
let lastUnsupportedWarning = null;

function isSupported(prop)
{
    return !currentProps || !!currentProps[prop];
}

for (const prop in valueProps) valueProps[prop].forEach((p) => { p.on("onLinkChanged", updateUi); });
for (const prop in texProps) texProps[prop].on("onLinkChanged", updateUi);
for (const prop in valueProps) valueProps[prop][0].onChange = updateUi;
updateUi();

// greys out unsupported ports and warns about connected ones
function updateUi()
{
    const unsupportedLinked = [];

    for (const prop in valueProps)
    {
        const ports = valueProps[prop];
        const supported = isSupported(prop);
        const toggle = ports[0];

        ports.forEach((p) =>
        {
            p.setUiAttribs({ "greyout": !supported || (p != toggle && !toggle.get()) });
            if (!supported && p.isLinked()) unsupportedLinked.push(p.name);
        });
    }

    for (const prop in texProps)
    {
        const p = texProps[prop];
        const supported = isSupported(prop);
        p.setUiAttribs({ "greyout": !supported });
        if (!supported && p.isLinked()) unsupportedLinked.push(p.name);
    }

    const msg = unsupportedLinked.length ? "not supported by the current material: " + unsupportedLinked.join(", ") : null;
    if (msg !== lastUnsupportedWarning)
    {
        lastUnsupportedWarning = msg;
        op.setUiError("unsupported", msg, 1);
    }
}

// warns when a texture is connected here, but the material has no texture bound to replace
function setTexWarning(names)
{
    const msg = names.length ? "material has no texture for (connect a texture to the material first): " + names.join(", ") : null;
    if (msg === lastWarning) return;
    lastWarning = msg;
    op.setUiError("texmissing", msg, 1);
}

function copyVal(v)
{
    return Array.isArray(v) || ArrayBuffer.isView(v) ? Array.from(v) : v;
}

// finds the texture stack slot of a uniform (the material pushes its textures before triggering children)
function findTexSlot(shader, uni)
{
    const stack = shader._textureStackUni;
    if (!stack) return -1;
    for (let i = 0; i < stack.length; i++)
        if (stack[i] && stack[i].name == uni.name) return i;
    return -1;
}

exec.onTriggered = () =>
{
    const cgl = op.patch.cgl;
    const shader = cgl.getShader();
    const props = (shader && shader.materialPropUniforms) || {};

    currentProps = props;
    const supported = Object.keys(props).filter((k) => { return !!props[k]; }).join(", ");
    if (supported !== lastSupported)
    {
        lastSupported = supported;
        outSupported.set(supported);
        updateUi();
    }

    // [uniform, oldValue] for restoring
    const oldValues = [];
    const oldTextures = [];
    const missingTex = [];

    function setValue(name, value)
    {
        const uni = props[name];
        if (!uni || !uni.setValue) return;
        oldValues.push([uni, copyVal(uni.getValue())]);
        uni.setValue(value);
    }

    if (inSetColor.get()) setValue("diffuseColor", [r.get(), g.get(), b.get(), a.get()]);
    if (inSetRoughness.get()) setValue("pbrRoughness", inRoughness.get());
    if (inSetMetalness.get()) setValue("pbrMetalness", inMetalness.get());
    if (inSetUnlit.get()) setValue("unlit", inUnlit.get() ? 1 : 0);
    if (inSetTexTrans.get()) setValue("texTransform", [inRepeatX.get(), inRepeatY.get(), inOffsetX.get(), inOffsetY.get()]);

    for (const prop in texProps)
    {
        const uni = props[prop];
        const tex = texProps[prop].get();
        if (!uni || !tex || !tex.tex) continue; // unsupported properties are handled in updateUi

        const slot = findTexSlot(shader, uni);
        if (slot == -1)
        {
            missingTex.push(texProps[prop].name); // material has no texture bound for this slot
            continue;
        }

        oldTextures.push([uni, shader._textureStackTexCgl[slot], shader._textureStackTex[slot]]);
        shader.setUniformTexture(uni, tex);
    }

    setTexWarning(missingTex);

    next.trigger();

    for (let i = oldValues.length - 1; i >= 0; i--)
        oldValues[i][0].setValue(oldValues[i][1]);

    for (let i = 0; i < oldTextures.length; i++)
    {
        const slot = findTexSlot(shader, oldTextures[i][0]);
        if (slot == -1) continue;
        shader._textureStackTexCgl[slot] = oldTextures[i][1];
        shader._textureStackTex[slot] = oldTextures[i][2];
    }
};
