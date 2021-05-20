const NUM_PORTS = 8;

const inIndex = op.inValueInt("Object Index", 0);
const objectPorts = [];
const outObject = op.outObject("object out");

op.onLoaded = function () { onPortChange(); indexChanged(); };
inIndex.onChange = indexChanged;

let inputNum = 0;

for (let i = 0; i < NUM_PORTS; i++)
{
    let port = op.inObject("object port " + i);
    inputNum = i;
    port.onChange = onPortChange;
    objectPorts[i] = port;
}

function indexChanged()
{
    let index = Math.max(0, Math.floor(inIndex.get()));
    if (index < 0) index = 0;
    else if (index > NUM_PORTS - 1) index = NUM_PORTS - 1;

    outObject.set(null);
    outObject.set(objectPorts[index].get());
}

function onPortChange()
{
    if (inputNum != inIndex.get()) return;

    outObject.set(null);
    outObject.set(this.get());
}
