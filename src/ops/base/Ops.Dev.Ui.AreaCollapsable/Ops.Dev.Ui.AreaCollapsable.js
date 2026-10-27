const
    inTitle = op.inString("Title", ""),
    inDelete = op.inTriggerButton("Delete"),
    inCollapse = op.inTriggerButton("Collapse"),
    inSelectChilds = op.inTriggerButton("Select Children");

inTitle.setUiAttribs({ "hidePort": true });
inDelete.setUiAttribs({ "hidePort": true });
inCollapse.setUiAttribs({ "hidePort": true });
inSelectChilds.setUiAttribs({ "hidePort": true });

op.setUiAttrib({ "hasArea": true, "collapsable": true });

op.init =
    inTitle.onChange =
    op.onLoaded = update;

update();

op.setUiAttribs({ "areaCollapsed": false });

function update()
{
    if (CABLES.UI)
    {
        gui.savedState.setUnSaved("areaOp", op.getSubPatch());
        op.setUiAttribs(
        {
            "comment_title": inTitle.get() || " "
        });

        op.name = inTitle.get();
    }
}

inDelete.onTriggered = () =>
{
    op.patch.deleteOp(op.id);
};

inSelectChilds.onTriggered = () =>
{
    if (CABLES.UI) gui.patchView.selectAreaChilds(op);
};

inCollapse.onTriggered = () =>
{
    if (CABLES.UI) gui.patchView.setAreaCollapsed(op, !op.uiAttribs.areaCollapsed);
};
