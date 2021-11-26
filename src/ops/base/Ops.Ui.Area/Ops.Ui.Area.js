const inTitle = op.inString("Title", "");
// exe=op.inTrigger("Trigger"),
// inNum=op.inInt("Num",5),
// trigger=op.outTrigger("Next"),
// idx=op.outNumber("Index");

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
        op.uiAttr(
            {
                "comment_title": inTitle.get() || " "
            });

        op.name = inTitle.get();
    }
}
