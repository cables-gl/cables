const parentPort = op.inObject("link");
const labelPort = op.inValueString("Text", "Presets");
const siblingsPort = op.outObject("Children");

const inAddPreset = op.inTriggerButton("Add Preset");
const inUpdatePreset = op.inTriggerButton("Update current Preset");

inAddPreset.onTriggered = addPreset;
inUpdatePreset.onTriggered = updatePreset;
parentPort.onChange = onParentChanged;

const presetPorts = [];

const el = document.createElement("div");
el.classList.add("sidebar__item");
el.classList.add("sidebar__select");
const label = document.createElement("div");
label.classList.add("sidebar__item-label");
const labelText = document.createTextNode(labelPort.get());
label.appendChild(labelText);
el.appendChild(label);
const selectList = document.createElement("select");
selectList.classList.add("sidebar__select-select");
el.appendChild(selectList);

const MAX_PRESETS = 8;

for (let i = 0; i < MAX_PRESETS; i++)
{
    const inp = op.inObject("Preset " + i);
    presetPorts.push(inp);
    inp.onLinkChanged = updateSelect;
}

selectList.onchange = function ()
{
    setSidebar(selectList.options[selectList.selectedIndex].value);
};

op.init = function ()
{
    for (let i = 0; i < MAX_PRESETS; i++)
        if (presetPorts[i].isLinked())
            return setSidebar(0);
};

function updateSelect()
{
    while (selectList.firstChild) selectList.removeChild(selectList.firstChild);

    for (let i = 0; i < MAX_PRESETS; i++)
    {
        if (presetPorts[i].isLinked())
        {
            const option = document.createElement("option");
            option.value = i;

            const other = presetPorts[i].links[0].getOtherPort(presetPorts[i]);

            // other.parent.removeListener("onTitleChange",updateSelect);
            if (!other.parent.hasEventListener("onTitleChange", updateSelect))
                other.parent.addEventListener("onTitleChange", updateSelect);

            option.text = "" + other.parent.name;
            selectList.appendChild(option);
        }
    }
}

function onParentChanged()
{
    const parent = parentPort.get();
    if (parent && parent.parentElement)
    {
        parent.parentElement.appendChild(el);
        siblingsPort.set(null);
        siblingsPort.set(parent);
    }
    else
    { // detach
        if (el.parentElement)
        {
            el.parentElement.removeChild(el);
        }
    }
}


function deSerializeSidebar(obj)
{
    if (!obj) return;
    if (!obj.ops) return;

    for (let i = 0; i < obj.ops.length; i++)
    {
        const theOp = op.patch.getOpById(obj.ops[i].id);
        if (theOp)
        {
            for (const portName in obj.ops[i].ports)
            {
                const p = theOp.getPortByName(portName);
                if (p)
                {
                    p.set(obj.ops[i].ports[portName].value);
                }
                else
                {
                    op.logError("unknown p!");
                }

                const def = theOp.getPortByName("Input");
                if (def)
                {
                    def.set(obj.ops[i].ports[portName]);
                }
            }
        }
    }
}


// inSet.onTriggered=setSidebar;
function setSidebar(idx)
{
    const obj = presetPorts[idx].get();
    deSerializeSidebar(obj);
}

function onDelete()
{
    removeElementFromDOM(el);
}

function removeElementFromDOM(el)
{
    if (el && el.parentNode && el.parentNode.removeChild)
    {
        el.parentNode.removeChild(el);
    }
}

function updatePreset()
{
    const r = serializeSidebar();
    const idx = selectList.options[selectList.selectedIndex].value;

    const valueOp = presetPorts[idx].links[0].getOtherPort(presetPorts[idx]).parent;
    valueOp.getPortByName("JSON String").set(JSON.stringify(r));
}


function serializeSidebar()
{
    const values = [];
    for (let i = 0; i < op.patch.ops.length; i++)
    {
        if (
            op.patch.ops[i].objName.indexOf("Ops.Sidebar.Sidebar") == -1 &&
            op.patch.ops[i].objName.indexOf("AsObject") == -1 &&
            op.patch.ops[i].objName.indexOf("Group") == -1 &&
            op.patch.ops[i].objName.indexOf("Preset") == -1 &&
            op.patch.ops[i].objName.indexOf("Ops.Sidebar") === 0
        )
        {
            let foundPort = false;

            const theOp = op.patch.ops[i];
            const p = {};
            p.id = theOp.id;
            p.objName = theOp.objName;
            p.ports = {};

            for (let j = 0; j < op.patch.ops[i].portsOut.length; j++)
            {
                if (theOp.portsOut[j].type == CABLES.OP_PORT_TYPE_VALUE)
                {
                    p.ports[theOp.portsOut[j].name] = theOp.portsOut[j].get();
                    foundPort = true;
                }
            }

            if (foundPort)values.push(p);
        }
    }

    const r = { "ops": values };

    if (CABLES.UI && gui) gui.savedState.setUnSaved("preset sidebar");
    return r;
}


function addPreset()
{
    let freePort = 0;
    let i = 0;
    for (i = 0; i < MAX_PRESETS; i++)
    {
        if (!presetPorts[i].isLinked())
        {
            freePort = presetPorts[i];
            break;
        }
    }

    const r = serializeSidebar();

    const newOp = op.patch.addOp("Ops.Json.ParseObject");
    newOp.getPortByName("JSON String").set(JSON.stringify(r));
    if (CABLES.UI)gui.patchView.centerSelectOp(newOp);

    op.patch.link(op, freePort.name, newOp, "Result");
}


op.serializeSidebar = serializeSidebar;
op.deSerializeSidebar = deSerializeSidebar;
