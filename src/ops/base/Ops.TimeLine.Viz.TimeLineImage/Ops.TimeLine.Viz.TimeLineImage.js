const
    animPort = op.inObject("Test"),
    inStart = op.inFloat("Start", 1),
    inEnd = op.inFloat("End", 7);

animPort.setUiAttribs({ "hidePort": true });
animPort.setAnimated(true);
let rect = null;

animPort.renderTimeLine = (tl) =>
{
    if (!rect)
    {
        rect = tl.rectInstancer.createRect();
    }

    const newX = tl.tl.view.timeToPixelScreen(inStart.get());
    const endX = tl.tl.view.timeToPixelScreen(inEnd.get());

    rect.setPosition(newX, tl.animLine.posY(), -0.1);

    rect.setSize(endX - newX, tl.animLine.height);
};
animPort.on("tlVizDispose", () =>
{
    console.log("dispose");
    disposeRects();
});

function disposeRects()
{
    rect.dispose();
}

op.onDelete = () =>
{
    disposeRects();

    animPort.renderTimeLine = null;
};
