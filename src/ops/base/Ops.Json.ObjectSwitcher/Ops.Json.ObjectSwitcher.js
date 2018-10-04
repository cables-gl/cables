const NUM_PORTS = 8;

const inIndex = op.inValueInt("Object Index");

const objectPorts = [];
const obj = null;

const outObject = op.outObject("object out");
for(var i = 0; i < NUM_PORTS; i++)
{
    objectPorts[i] = op.inObject("object port " + i);
    objectPorts[i].inputNum = i;
    objectPorts[i].onChange = function()
    {
        if(this.inputNum == inIndex.get())
        {
            outObject.set(null);
            outObject.set(this.get());
        }
    };
}



function indexChanged()
{
    var index = inIndex.get();
    if(index < 0) index = 0;
    if(index > NUM_PORTS-1) index = NUM_PORTS-1;
    outObject.set(null);
    outObject.set(objectPorts[index].get());
}

inIndex.onChange = indexChanged;


