const
    exec = op.inTriggerButton("Open"),
    inMeth = op.inSwitch("Method", ["anchor", "document.location", "window.open"], "anchor"),
    inUrl = op.inString("URL", "https://cables.gl"),
    inTarget = op.inSwitch("Target", ["_blank", "_self", "_parent", "_top", "frame name"]),
    inTargetString = op.inString("Frame Name", ""),
    inSpecs = op.inString("Win Specs", ""),
    inRel = op.inString("rel Attribute", "");

let targetStr = "";

inMeth.onChange =
inTarget.onChange = updateUi;

updateUi();

function updateUi()
{
    inTargetString.setUiAttribs({ "greyout": inTarget.get() != "frame name" });
    inTarget.setUiAttribs({ "greyout": inMeth.get() == "document.location" });
    inSpecs.setUiAttribs({ "greyout": inMeth.get() != "window.open" });
    inRel.setUiAttribs({ "greyout": inMeth.get() != "anchor" });

    targetStr = inTarget.get();
    if (targetStr == "frame name")targetStr = inTargetString.get();
}

exec.onTriggered = function ()
{
    if (inMeth.get() == "anchor")
    {
        const link = document.createElement("a");
        link.href = inUrl.get();
        link.target = inTarget.get();
        link.rel = inRel.get();

        link.click();
    }
    if (inMeth.get() == "document.location")
    {
        document.location.href = inUrl.get();
    }
    else
    {
        window.open(inUrl.get(), inTarget.get(), inSpecs.get());
    }
};
