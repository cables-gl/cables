const inTitle = op.inString("Title", "");

inTitle.setUiAttribs({ "hidePort": true });

op.setUiAttrib({ "hasArea": true });

// exe.onTriggered=function()
// {
//     op.patch.instancing.pushLoop(inNum.get());

//     for(let i=0;i<inNum.get();i++)
//     {
//         idx.set(i);
//         trigger.trigger();
//         op.patch.instancing.increment();
//     }

//     op.patch.instancing.popLoop();
// };

op.init =
    inTitle.onChange =
    op.onLoaded = update;

update();

function update()
{
    if (CABLES.UI)
    {
        // gui.setStateUnsaved({ "op": op });
        gui.savedState.setUnSaved("areaOp");
        op.uiAttr(
            {
                "comment_title": inTitle.get() || " "
            });

        op.name = inTitle.get();
    }
}
