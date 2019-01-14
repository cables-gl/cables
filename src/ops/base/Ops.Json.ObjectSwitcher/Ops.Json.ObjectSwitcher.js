const NUM_PORTS = 8;

const inIndex = op.inValueInt("Object Index");
const objectPorts = [];
const outObject = op.outObject("object out");

inIndex.onChange = indexChanged;

for(var i = 0; i < NUM_PORTS; i++)
{
    var port = op.inObject("object port " + i);
    port.data.inputNum = i;
    port.onChange = onPortChange;
    objectPorts[i]=port;
}

function indexChanged()
{
    var index = Math.max(0,Math.floor(inIndex.get()));
    if(index < 0) index = 0;
        else if(index > NUM_PORTS-1) index = NUM_PORTS-1;

    outObject.set(null);
    outObject.set(objectPorts[index].get());
}

function onPortChange()
{
    if(op.data.inputNum != inIndex.get()) return;

    outObject.set(null);
    outObject.set(this.get());
}



