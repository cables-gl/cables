const
    inUpd = op.inTriggerButton("Update"),
    outPerc = op.outNumber("coverage"),
    outMissing = op.outArray("Missing");

inUpd.onTriggered = update;

function update()
{

    let countFound = 0;
    let count = 0;
    let missing = [];
    // for(const i in CABLES.OPS)
    for (let i = 0; i < gui.opDocs._opDocs.length; i++)
    {
        if (gui.opDocs._opDocs[i].name.startsWith("Ops.Extension.ShaderGraph"))
        {
            count++;
            const arr = op.patch.getOpsByOpId(gui.opDocs._opDocs[i].id);
            if (arr.length > 0) countFound++;
            else missing.push(gui.opDocs._opDocs[i].name);
            // console.log("arr",gui.opDocs._opDocs[i].id, arr.length);

        }

    }

    outPerc.set(countFound / count);
    console.log("found..." + countFound + "/" + count);
    console.log(missing);
    outMissing.setRef(missing);

}
