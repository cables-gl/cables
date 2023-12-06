const
    dataPort = op.inString("data", ""),
    setsPort = op.inString("sets", ""),
    id = op.inString("presetid", CABLES.shortId()),

    inInterPolate = op.inSwitch("Interpolation", ["None", "xfade", "a-b"], "None"), // "a..b","a..c"

    presetA = op.inFloat("Preset A", "0"),
    presetB = op.inFloat("Preset B", "1"),
    presetFade = op.inFloatSlider("Fade", 0.0),

    presetNames = op.inDropDown("Preset", []),
    presetCreate = op.inTriggerButton("Create new"),
    presetUpdate = op.inTriggerButton("Update"),
    move = op.inUiTriggerButtons("move", ["↑", "↓"]),

    presetDelete = op.inTriggerButton("Delete"),
    presetRename = op.inTriggerButton("Rename"),

    addPort = op.addOutPort(new CABLES.Port(op, "Create Variable", CABLES.OP_PORT_TYPE_DYNAMIC)),
    outNum = op.outNumber("Num Presets", 0),
    outNumCurrentPreset = op.outNumber("current Preset", 0),
    outDbgData = op.outArray("dbg_data"),
    outDbgSets = op.outArray("dbg_sets");
let data = [];
let presets = [];
const valuePorts = [];
let interpolate = 0;

presetB.changeAlways = true;
presetA.changeAlways = true;

op.setPortGroup("Manage Presets", [presetCreate, presetUpdate, presetDelete, presetNames, move, presetRename]);
dataPort.setUiAttribs({ "hideParam": true, "hidePort": true });
id.setUiAttribs({ "hideParam": true, "hidePort": true });
setsPort.setUiAttribs({ "hideParam": true, "hidePort": true });
presetCreate.setUiAttribs({ "hidePort": true });
presetUpdate.setUiAttribs({ "hidePort": true });
presetDelete.setUiAttribs({ "hidePort": true });
presetRename.setUiAttribs({ "hidePort": true });
presetNames.setUiAttribs({ "showIndex": true });
presetCreate.setUiAttribs({ "buttonTitle": "Create New Preset" });
presetDelete.setUiAttribs({ "buttonTitleClass": "button-small" });
presetRename.setUiAttribs({ "buttonTitleClass": "button-small" });

presetNames.onChange = updatePreset;
inInterPolate.onChange = updateInterpolation;
presetA.onChange =
    presetB.onChange =
    presetFade.onChange = updateFade;

updateInterpolation();
updateDropdown();
updatePreset();
updateButtons();

function movePreset(from, to)
{
    const f = presets.splice(from, 1)[0];
    presets.splice(to, 0, f);
}

move.onTriggered = function (which)
{
    const current = presetNames.get();
    const idx = presetNames.uiAttribs.values.indexOf(current);

    if (which == "↓") movePreset(idx, idx + 1);
    if (which == "↑") movePreset(idx, Math.max(0, idx - 1));

    updateDropdown();
    updatePreset();
};

op.init = function ()
{
    if (presets.length > 0 && data.length == 0)
    {
        op.logError("it happened again!!");

        // this happened only once for now, find out how to reproduce it!!!
        const keys = Object.keys(presets[0].values);

        for (let i = 0; i < keys.length; i++)
        {
            data.push(
                {
                    "varname": keys[i],
                    "type": 0,
                    "title": keys[i]

                });
        }
        saveData();
    }
};

function updateInterpolation()
{
    const ip = inInterPolate.get();
    if (ip === "None")
    {
        interpolate = 0;
        presetA.setUiAttribs({ "greyout": true });
        presetB.setUiAttribs({ "greyout": true });
        presetFade.setUiAttribs({ "greyout": true });
    }
    else if (ip === "xfade")
    {
        interpolate = 1;
        presetA.setUiAttribs({ "greyout": false });
        presetB.setUiAttribs({ "greyout": false });
        presetFade.setUiAttribs({ "greyout": false });
    }
    else if (ip === "a-b")
    {
        interpolate = 2;
        presetA.setUiAttribs({ "greyout": false });
        presetB.setUiAttribs({ "greyout": true });
        presetFade.setUiAttribs({ "greyout": true });
    }

    op.setUiAttrib({ "extendTitle": ip });

    if (interpolate !== 0) updateFade();
    else updatePreset();
}

function updateFade()
{
    if (interpolate === 0) return;

    let fade = 0;
    let idxa = 0;
    let idxb = 0;

    if (interpolate === 2) // a-b
    {
        const pr = presetA.get();
        idxa = Math.floor(pr);
        idxb = Math.ceil(pr);
        fade = pr % 1;

        if (idxa >= presets.length) idxa = presets.length - 1;
        if (idxb >= presets.length) idxb = presets.length - 1;
    }
    else if (interpolate === 1) // xfade
    {
        fade = presetFade.get();
        idxa = Math.floor(presetA.get());
        idxb = Math.floor(presetB.get());
    }

    const a = presets[idxa];
    const b = presets[idxb];

    if (!a || !b)
    {
        op.warn("preset not found");
        return;
    }

    // todo: cache variable, so no string lookup needed every time...

    for (const i in a.values)
    {
        const ip = a.values[i] + (b.values[i] - a.values[i]) * fade;
        op.patch.setVarValue(i, ip);
    }
}

function saveData()
{
    savePresets();
}

function savePresets()
{
    dataPort.set(JSON.stringify(data));

    setsPort.set(JSON.stringify(presets));
    outNum.set(presets.length);
    setDebugOutput();
}

function setPresetValues(preset)
{
    preset.values = preset.values || {};

    for (let i = 0; i < valuePorts.length; i++)
        preset.values[valuePorts[i].name] = valuePorts[i].value;

    return preset;
}

function updateButtons()
{
    presetDelete.setUiAttribs({ "greyout": presetNames.uiAttribs.values.length == 0 });
    presetUpdate.setUiAttribs({ "greyout": presetNames.uiAttribs.values.length == 0 });
    presetRename.setUiAttribs({ "greyout": presetNames.uiAttribs.values.length == 0 });

    move.setUiAttribs({ "greyout": presetNames.uiAttribs.values.length == 0 });

    const preset = getPreset(presetNames.get());
    if (preset)
    {
        presetDelete.setUiAttribs({ "buttonTitle": "Delete " + preset.name });
        presetUpdate.setUiAttribs({ "buttonTitle": "Update " + preset.name });
        presetRename.setUiAttribs({ "buttonTitle": "Rename " + preset.name });
    }
}

function updateDropdown()
{
    presetNames.uiAttribs.values.length = 0;
    for (let i = 0; i < presets.length; i++)
        presetNames.uiAttribs.values.push(presets[i].name);

    updateButtons();
    savePresets();
    setDebugOutput();
}

function getPreset(name)
{
    for (let i = 0; i < presets.length; i++)
        if (presets[i] && presets[i].name == name)
            return presets[i];
}

setsPort.onChange = function ()
{
    presets = JSON.parse(setsPort.get());
    outNum.set(presets.length);
    updateDropdown();
    setsPort.onChange = null;
};

function updatePreset()
{
    const preset = getPreset(presetNames.get());

    if (!preset) return;

    const varnames = Object.keys(preset.values);

    for (let i = 0; i < varnames.length; i++)
    {
        const p = op.getPort(varnames[i]);
        if (p)
        {
            p.set(preset.values[varnames[i]]);
            if (interpolate === 0)p.forceChange();
        }
    }

    if (interpolate !== 0) updateFade();

    updateButtons();
    op.refreshParams();
}

presetUpdate.onTriggered = function ()
{
    let preset = getPreset(presetNames.get());
    preset = setPresetValues(preset);
    savePresets();
};

presetCreate.onTriggered = function ()
{
    if (!op.patch.isEditorMode()) return;

    new CABLES.UI.ModalDialog({
        "prompt": true,
        "title": "New Preset",
        "text": "Enter a new preset name",
        "promptValue": "",
        "promptOk": (str) =>
        {
            op.refreshParams();
            presetNames.set(str);
            let preset = { "name": str };
            preset = setPresetValues(preset);
            presets.push(preset);
            updateDropdown();
            savePresets();
        } });
};

presetDelete.onTriggered = function ()
{
    if (!CABLES.UI) return;
    const current = presetNames.get();
    const idx = presetNames.uiAttribs.values.indexOf(current);
    presets.splice(idx, 1);
    saveData();

    if (presets.length > 0)
        presetNames.set(presets[0].name);

    op.refreshParams();
    updateDropdown();
    updateButtons();
};

presetRename.onTriggered = function ()
{
    if (!CABLES.UI) return;

    new CABLES.UI.ModalDialog({
        "prompt": true,
        "title": "New Preset",
        "text": "Enter a new preset name",
        "promptValue": "",
        "promptOk": (str) =>
        {
            if (!str) return;
            const current = presetNames.get();
            const idx = presetNames.uiAttribs.values.indexOf(current);
            presets[idx].name = str;
            presetNames.set(str);
            saveData();
            updateDropdown();
            op.refreshParams();
        }
    });
};

dataPort.onChange = function ()
{
    data = JSON.parse(dataPort.get());

    for (let i = 0; i < data.length; i++)
    {
        const portObject = data[i];

        const varname = portObject.varname;

        if (!op.getPort(varname))
        {
            if (portObject.type == CABLES.OP_PORT_TYPE_VALUE)
            {
                const val = op.patch.getVarValue(varname);
                const port = op.inFloat(varname, val);

                port.setUiAttribs({
                    "editableTitle": true,
                    "title": portObject.title });

                listenPortChange(port, varname);

                port.set(val);
                port.forceChange();
            }
        }
    }

    setDebugOutput();
    // dataPort.onChange=null;
};

function listenPortChange(port, varname)
{
    valuePorts.push(port);
    port.onChange = function ()
    {
        op.patch.setVarValue(varname, port.get());
    };

    port.addEventListener("onUiAttrChange", (attribs) =>
    {
        if (attribs.title)
        {
            const thePort = data.find((p) => { return p.varname === varname; });
            if (thePort)
            {
                thePort.title = attribs.title;
                saveData();
            }
        }
    });
}

op.patch.addEventListener("onOpDelete", (optodelete) =>
{
    if (optodelete.objName.indexOf("VarGet") == -1) return;

    const newData = [];
    for (let i = 0; i < data.length; i++)
    {
        let found = false;

        for (let oi = 0; oi < op.patch.ops.length; oi++)
        {
            const opt = op.patch.ops[oi];

            if (opt != optodelete &&
                opt.objName.indexOf("VarGet" > -1) &&
                opt.varName &&
                opt.varName.get &&
                opt.varName.get() == data[i].varname)
            {
                found = true;
                break;
            }
        }

        if (found)
        {
            newData.push(data[i]);
        }
        else
        {
            op.removePort(op.getPort(data[i].varname));
        }
    }

    data = newData;
    saveData();

    op.refreshParams();
    setTimeout(op.refreshParams.bind(this), 1000);
});

function setDebugOutput()
{
    outDbgData.set(data);
    outDbgSets.set(presets);
}

addPort.onLinkChanged = function ()
{
    if (addPort.links.length === 0)
    {
        op.log("no links!");
        return;
    }

    const link = addPort.links[0];
    const otherPort = link.getOtherPort(addPort);

    const varname = ".preset_" + otherPort.name + "_" + id.get() + "_" + CABLES.shortId();

    op.log("pilength", op.portsIn.length);

    data.push(
        {
            "varname": varname,
            "title": otherPort.parent.name + " " + otherPort.name,
            "type": otherPort.type
        });

    const oldValue = otherPort.get();

    op.patch.setVarValue(varname, oldValue);
    op.patch.getVar(varname).type = "preset";

    addPort.removeLinks();
    saveData();
    op.refreshParams();

    otherPort.setVariable(varname);
};

op.onDelete = (reloading) =>
{
    if (reloading) return;
    for (let i = 0; i < data.length; i++)
        op.patch.deleteVar(data[i].varname);
};
