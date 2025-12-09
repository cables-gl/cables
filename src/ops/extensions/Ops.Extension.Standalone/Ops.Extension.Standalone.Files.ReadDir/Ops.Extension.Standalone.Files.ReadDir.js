const fs=op.require("fs");
const
    inPath=op.inString("Path","/"),
    reload=op.inTriggerButton("Reload"),
    outEntries=op.outArray("Entries"),
    outError=op.outBoolNum("Has Error"),
    outErrorStr=op.outString("Error");

reload.onTriggered=
    inPath.onChange = update;

function update()
{
    try
    {
        const arr=fs.readdirSync(inPath.get());
        outEntries.set(arr);
        outError.set(false);
        outErrorStr.set("");
    }
    catch(err)
    {
        outError.set(true);
        outErrorStr.set(err.message);
    }
}
