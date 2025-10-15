const
    animPort = op.inObject("Test"),
    inBpm = op.inFloat("BPM", 80),
    inOffset = op.inFloat("Offset");
animPort.setUiAttribs({ "hidePort": true, "tlDrawKeys": false });
op.setUiAttribs({ "tlOrder": -100 });

animPort.setAnimated(true);
let rects = [];

animPort.on("tlVizDispose", () =>
{
    console.log("dispose");
    disposeRects();
});

animPort.renderTimeLine = (tl) =>
{
    const beatDuration = 60 / inBpm.get();
    const tlLength = tl.tl.view.timeRight - tl.tl.view.timeLeft;
    const numbeats = Math.ceil(tlLength / beatDuration) + 1;
    const firstBeat = Math.floor(tl.tl.view.timeLeft / beatDuration);

    for (let i = rects.length; i < numbeats; i++)
    {
        rects[i] = tl.rectInstancer.createRect();
        console.log("create");
    }

    const off = inOffset.get();

    for (let i = 0; i < rects.length; i++)
    {
        const t = (i + firstBeat) * beatDuration + off;
        if (t < 0)rects[i].setColor(0.4, 0.4, 0.4, 0);
        else if ((i + firstBeat) % 4 == 0) rects[i].setColor(0.7, 0.7, 0.7, 1);
        else rects[i].setColor(0.4, 0.4, 0.4, 1);
        rects[i].setSize(tl.tl.view.timeToPixel(beatDuration) - 1, tl.animLine.drawAreaHeight);
        rects[i].setPosition(tl.tl.view.timeToPixelScreen(t), tl.animLine.posY(), -0.1);
    }
    console.log("animlinenheight", tl.animLine.height);
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
