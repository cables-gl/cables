new CABLES.SubPatchOp(this);

if (CABLES.UI && CABLES.sandbox.isDevEnv())
{
    const inMakeBp = op.inTriggerButton("Create Blueprint");
    inMakeBp.setUiAttribs({ "hidePort": true });

    inMakeBp.onTriggered = makeBlueprint;
}

function makeBlueprint()
{
    const bpOp = op.patch.addOp(CABLES.UI.DEFAULTOPNAMES.blueprint);

    bpOp.getPortByName("externalPatchId").set(gui.patchId);
    bpOp.getPortByName("subPatchId").set(op.patchId.get());
    bpOp.getPortByName("active").set(true);

    let attribs =
        {
            "translate":
            {
                "x": op.uiAttribs.translate.x - 150,
                "y": op.uiAttribs.translate.y
            }
        };

    if (CABLES.UI)attribs.subPatch = gui.patchView.getCurrentSubPatch();

    bpOp.uiAttr(attribs);
}
