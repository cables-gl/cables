const presets = ["all", "default", "sensible", "colorblind", "fancy-light", "fancy-dark", "shades", "tarnish", "pastel", "pimp", "intense", "fluo", "red-roses", "ochre-sand", "yellow-lime", "green-mint", "ice-cube", "blue-ocean", "indigo-night", "purple-wine"];
const distances = ["euclidean", "cmc", "compromise", "protanope", "tritanope"];

const inCount = op.inInt("Color count", 1),
    inColorSpace = op.inSwitch("Color space", ["preset", "custom"], "custom"),
    inPreset = op.inDropDown("Preset", presets, "all"),

    inOutFormat = op.inSwitch("Format", ["RGB Floats", "Hex Strings"], "RGB Floats"),
    inSeed = op.inFloat("Seed", 0),
    inAlpha = op.inFloatSlider("Alpha", 1),
    inHueMin = op.inFloatSlider("Hue min", 0),
    inHueMax = op.inFloatSlider("Hue max", 1),
    inChromaMin = op.inFloatSlider("Chroma min", 0),
    inChromaMax = op.inFloatSlider("Chroma max", 1),
    inLightMin = op.inFloatSlider("Lightness min", 0),
    inLightMax = op.inFloatSlider("Lightness max", 1),
    inClustering = op.inSwitch("Clustering", ["k-means", "force-vector"], "k-means"),
    inQuality = op.inInt("Quality", 1),
    inAttempts = op.inInt("Attempts", 3),
    inDistance = op.inDropDown("Distance", distances, "euclidean"),
    outHexColors = op.outArray("Hex Colors"),
    outNbCol = op.outNumber("Array length");

op.setPortGroup("Custom color space", [inHueMin, inHueMax, inChromaMin, inChromaMax, inLightMin, inLightMax]);
op.setPortGroup("Advanced settings", [inClustering, inQuality, inAttempts, inDistance]);

let timeout = null;

inOutFormat.onChange =
inCount.onChange = inColorSpace.onChange =
    inPreset.onChange = inSeed.onChange =
    inHueMin.onChange = inHueMax.onChange =
    inChromaMin.onChange = inChromaMax.onChange =
    inLightMin.onChange = inLightMax.onChange =
    inClustering.onChange = inQuality.onChange =
    inAttempts.onChange = inDistance.onChange = () =>
    {
        clearTimeout(timeout);
        timeout = setTimeout(run, 50);
    };

run();

function updateUi()
{
    inPreset.setUiAttribs({ "greyout": inColorSpace.get() != "preset" });
    inHueMin.setUiAttribs({ "greyout": inColorSpace.get() == "preset" });
    inHueMax.setUiAttribs({ "greyout": inColorSpace.get() == "preset" });
    inChromaMin.setUiAttribs({ "greyout": inColorSpace.get() == "preset" });
    inChromaMax.setUiAttribs({ "greyout": inColorSpace.get() == "preset" });
    inLightMin.setUiAttribs({ "greyout": inColorSpace.get() == "preset" });
    inLightMax.setUiAttribs({ "greyout": inColorSpace.get() == "preset" });
}

function clamp(num, min, max)
{
    return num <= min
        ? min
        : num >= max
            ? max
            : num;
}

function run()
{
    if (!window.IWantHue)
    {
        op.logError("Library IWantHue not loaded");
        outHexColors.set(null);
        outNbCol.set(0);
        return;
    }

    updateUi();

    const count = Math.max(1, inCount.get());
    let settings = {
        "attempts": clamp(inAttempts.get(), 1, 5),
        "quality": clamp(inQuality.get(), 1, 100),
        "distance": inDistance.get(),
        "clustering": inClustering.get(),
        "seed": inSeed.get()
    };
    const cs = inColorSpace.get();
    if (cs === "preset")
    {
        const preset = inPreset.get();
        settings.colorSpace = preset;
    }
    else
    {
        const colorSpace = [
            Math.min(inHueMin.get() * 360, inHueMax.get() * 360),
            Math.max(inHueMin.get() * 360, inHueMax.get() * 360) + 0.001,

            Math.min(inChromaMin.get() * 100, inChromaMax.get() * 100),
            Math.max(inChromaMin.get() * 100, inChromaMax.get() * 100) + 0.001,

            Math.min(inLightMin.get() * 100, inLightMax.get() * 100),
            Math.max(inLightMin.get() * 100, inLightMax.get() * 100) + 0.001,
        ];
        settings.colorSpace = colorSpace;
    }

    try
    {
        let res = window.IWantHue(count, settings);

        if (inOutFormat.get() == "RGB Floats")
        {
            let arr = [];
            for (let i = 0; i < res.length; i++)
            {
                arr.push(
                    hexToR(res[i] || "#ff0000") / 255,
                    hexToG(res[i] || "#ff0000") / 255,
                    hexToB(res[i] || "#ff0000") / 255, 1.0
                );
            }
            res = arr;
        }

        outHexColors.setRef(res);
        outNbCol.set(res.length);
    }
    catch (e)
    {
        console.log("err", count, settings, e);
    }
}

function hexToR(h)
{
    return parseInt((cutHex(h)).substring(0, 2), 16) || 0;
}

function hexToG(h)
{
    return parseInt((cutHex(h)).substring(2, 4), 16) || 0;
}

function hexToB(h)
{
    return parseInt((cutHex(h)).substring(4, 6), 16) || 0;
}

function cutHex(h = "")
{
    return (h.charAt(0) == "#") ? h.substring(1, 7) : h;
}
