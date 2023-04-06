const inIndex = op.inValueInt("Object Index", 0);
const outObject = op.outObject("object out");

const NUM_PORTS = 8;
const objectPorts = [];

op.onLoaded = function () { indexChanged(); };
inIndex.onChange = indexChanged;

for (let i = 0; i < NUM_PORTS; i++)
{
    let port = op.inObject("object port " + i);
    port.inputNum = i;
    port.onChange = onPortChange.bind(port);
    objectPorts[i] = port;
}

function indexChanged()
{
    let index = Math.max(0, Math.floor(inIndex.get()));
    if (index < 0) index = 0;
    else if (index > NUM_PORTS - 1) index = NUM_PORTS - 1;

    outObject.setRef(objectPorts[index].get());
}

function onPortChange()
{
    if (this.inputNum != inIndex.get()) return;

    outObject.setRef(this.get());
}
