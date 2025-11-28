const
    exec = op.inTriggerButton("Trigger"),
    inData = op.inString("DataUrl", ""),
    result = op.outNumber("Result");

exec.onTriggered = () =>
{
    if (CABLESUILOADER && CABLESUILOADER.talkerAPI)
        CABLESUILOADER.talkerAPI.send(CABLESUILOADER.TalkerAPI.CMD_SAVE_PATCH_SCREENSHOT,
            { "screenshot": inData.get() }, (err, r) =>
            {
                console.log("screenshot", err, r);
            });
};
