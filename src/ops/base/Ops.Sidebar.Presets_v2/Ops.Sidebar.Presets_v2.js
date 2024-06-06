const parentPort = op.inObject("link");
const labelPort = op.inString("Text", "Presets");
const siblingsPort = op.outObject("Children");

const inAddPreset = op.inTriggerButton("Add Preset");
const inUpdatePreset = op.inTriggerButton("Update current Preset");
const outIndex = op.outNumber("Index");

inAddPreset.onTriggered = addPreset;
inUpdatePreset.onTriggered = updatePreset;
parentPort.onChange = onParentChanged;

const presetPorts = [];
const presetTitlePorts = [];

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
    const inpTitle = op.inString("Preset Title " + i);
    const inp = op.inObject("Preset " + i);
    presetPorts.push(inp);
    presetTitlePorts.push(inpTitle);

    inpTitle.onLinkChanged = inp.onLinkChanged = updateSelect;
}

selectList.onchange = function ()
{
    outIndex.set(selectList.selectedIndex);
    setSidebar(selectList.options[selectList.selectedIndex].value);
};

op.patch.addEventListener("patchLoadEnd", initialize);
op.init = initialize;

function initialize()
{
    setTimeout(() =>
    {
        for (let i = 0; i < MAX_PRESETS; i++)
            if (presetPorts[i].isLinked())
                setSidebar(i);
        setSidebar(0);
    }, 1000);
}

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

            // if (!other.parent.hasEventListener(other.parent.onTitlechangeevent))
            // other.parent.onTitlechangeevent = other.parent.addEventListener("onTitleChange", updateSelect);

            option.text = "" + presetTitlePorts[i].get();
            selectList.appendChild(option);
        }
    }
}

function onParentChanged()
{
    siblingsPort.set(null);
    const parent = parentPort.get();
    if (parent && parent.parentElement)
    {
        parent.parentElement.appendChild(el);
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
                    if (typeof obj.ops[i].ports[portName] !== "object")
                    {
                        p.set(obj.ops[i].ports[portName]);
                    }
                    else
                    {
                        p.set(obj.ops[i].ports[portName].value);
                    }
                }
                else
                {
                    op.warn("unknown preset");
                }

                const def = theOp.getPortByName("Input");
                if (def)
                {
                    def.set(obj.ops[i].ports[portName]);
                }
                const namedInPort = theOp.getPortByName("Input " + p.name);
                if (namedInPort)
                {
                    namedInPort.set(obj.ops[i].ports[portName]);
                }
            }
        }
    }
}

function setSidebar(idx)
{
    const obj = presetPorts[idx].get();
    deSerializeSidebar(obj);
}

function onDelete()
{
    removeElementFromDOM(el);
}

function removeElementFromDOM(element)
{
    if (element && element.parentNode && element.parentNode.removeChild)
    {
        element.parentNode.removeChild(element);
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
            p.title = theOp.getTitle();
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

    if (CABLES.UI && gui) gui.setStateUnsaved();
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

    const newOp = op.patch.addOp("Ops.Json.ParseObject_v2");

    newOp.setUiAttribs({ "translate": {
        "x": op.uiAttribs.translate.x, "y": op.uiAttribs.translate.y - 100
    } });

    newOp.getPortByName("JSON String").set(JSON.stringify(r));

    if (CABLES.UI) gui.patchView.centerSelectOp(newOp.id);

    op.patch.link(op, freePort.name, newOp, "Result");
}

op.serializeSidebar = serializeSidebar;
op.deSerializeSidebar = deSerializeSidebar;
