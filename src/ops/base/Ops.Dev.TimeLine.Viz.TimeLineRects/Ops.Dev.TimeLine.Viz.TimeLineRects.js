const
    animPort = op.inObject("Test"),
    inPositions = op.inArray("Positions"),
    inSize = op.inArray("Size");

animPort.setUiAttribs({ "hidePort": true });
animPort.setAnimated(true);
let rect = null;

let rects = [];
animPort.on("tlVizHide", () =>
{
    console.log("heiiiiiiiiiiiide");
    for (let i = 0; i < rects.length; i++)
    {
        rects[i].setVisible(false);
    }
});

animPort.on("tlVizDispose", () =>
{
    console.log("dispose");
    disposeRects();
});

animPort.renderTimeLine = (tl) =>
{
    const arrPos = inPositions.get();
    const arrSize = inSize.get();

    if (!arrPos) return;
    const numbeats = arrPos.length;
    for (let i = rects.length; i < numbeats; i++) rects[i] = tl.rectInstancer.createRect();

    for (let i = 0; i < arrPos.length / 2; i++)
    {
        if (arrSize)
            rects[i].setSize(arrSize[i * 2], arrSize[i * 2 + 1] * tl.animLine.height);
        else
            rects[i].setSize(5, tl.animLine.height);

        rects[i].setPosition(tl.tl.view.timeToPixelScreen(arrPos[i * 2]), tl.animLine.posY() + arrPos[i * 2 + 1] * tl.animLine.height, -0.1);
    }
};

function disposeRects()
{
    for (let i = 0; i < rects.length; i++)
    {
        rects[i].dispose();
    }
    rects.length = 0;
}

op.onDelete = () =>
{
    disposeRects();

    animPort.renderTimeLine = null;
};
