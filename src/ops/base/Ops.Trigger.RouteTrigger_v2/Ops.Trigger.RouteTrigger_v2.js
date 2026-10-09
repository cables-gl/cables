const
    exePort = op.inTriggerButton("Execute"),
    switchPort = op.inInt("Switch Value"),
    numTrigs = op.outNumber("Total Connections"),
    outArrNames = op.outArray("Connected Op Names"),
    outTrigs = op.outMultiPort2("Trigger", CABLES.Port.TYPE_FUNCTION, null, 3);

exePort.onTriggered = update;

if(CABLES.UI)
{
  switchPort.on("change",updateUi);
  updateUi()
}

function update()
{
    const trigs = outTrigs.get();
    numTrigs.set(trigs.length);

    const index = Math.floor(switchPort.get());
    if (index >= 0 && index < trigs.length)
    {
        trigs[index].trigger();
    }
}

outTrigs.on(CABLES.Port.EVENT_LINK_CHANGED, () =>
{
    const arr = [];
    const trigs = outTrigs.get();
    for (let i = 0; i < trigs.length; i++)
    {
        if (trigs[i].isLinked())
        {
            const p = trigs[i].links[0].getOtherPort(trigs[i]);
            arr.push(p.op.opId);
        }
    }
    outArrNames.setRef(arr);
});




function updateUi()
{
if(!CABLES.UI)return;
  for (let i = 0; i < outTrigs.get().length; i++) outTrigs.get()[i].setUiAttribs({arrow:i==switchPort.get()})
}

