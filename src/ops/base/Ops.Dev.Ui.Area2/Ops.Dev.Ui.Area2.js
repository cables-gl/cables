const
    inTitle = op.inString("Title", ""),
    inDelete = op.inTriggerButton("Delete"),
    inCollapse = op.inTriggerButton("Collapse");

inTitle.setUiAttribs({ "hidePort": true });
inDelete.setUiAttribs({ "hidePort": true });
inCollapse.setUiAttribs({ "hidePort": true });

op.setUiAttrib({ "hasArea": true });

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
        op.uiAttr(
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
inCollapse.onTriggered = () =>
{
    const ops = op.patch.getOpsByArea(this.attribs.area);
    const col = !op.uiAttribs.areaCollapsed;

    for (let i = 0; i < ops.length; i++)
    {
        if (ops[i] != op)
            ops[i].setUiAttribs({ "hidden": col });
    }

    op.setUiAttribs({ "areaCollapsed": col });
};
