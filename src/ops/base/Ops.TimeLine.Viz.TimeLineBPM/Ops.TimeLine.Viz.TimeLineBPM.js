const
    animPort = op.inObject("Test"),
    inBpm = op.inFloat("BPM", 80),
    inOffset = op.inFloat("Offset");
animPort.setUiAttribs({ "hidePort": true, "tlDrawKeys": false });
op.setUiAttribs({ "tlOrder": -100 });

animPort.setAnimated(true);
let rects = [];

let activeRect = null;
let cursorText = null;
let cursorTextBgRect = null;

animPort.on("tlVizDispose", () =>
{
    disposeRects();
});

inBpm.onChange = () =>
{
    op.setUiAttrib({ "extendTitle": Math.round(inBpm.get()) });
};

animPort.renderTimeLine = (tl) =>
{
    const beatDuration = 60 / inBpm.get();
    const tlLength = tl.tl.view.timeRight - tl.tl.view.timeLeft;
    const numbeats = Math.ceil(tlLength / beatDuration) + 1;
    const firstBeat = Math.floor(tl.tl.view.timeLeft / beatDuration);

    for (let i = rects.length; i < numbeats; i++)
    {
        rects[i] = rects[i] || tl.rectInstancer.createRect();
    }

    if (!cursorText)
    {
        activeRect = tl.tl.overlayRects.createRect({ "draggable": false, "interactive": false, "name": "cursorTextBg" });

        cursorTextBgRect = tl.tl.overlayRects.createRect({ "draggable": false, "interactive": false, "name": "cursorTextBg" });
        cursorTextBgRect.setSize(40, 20);
        cursorTextBgRect.setParent(tl.tl.cursorVertLineRect);
        cursorTextBgRect.setColor(0.2, 0.2, 0.2, 1);

        cursorText = tl.tl.createText(tl.tl.textsNoScroll, "???");
        cursorText.setParentRect(tl.tl.cursorVertLineRect);

        tl.tl.setColorRectSpecial(cursorText);
    }

    const cursorY = tl.tl.getFirstLinePosy() - tl.animLine.drawAreaHeight;
    const padd = 5;
    const w = cursorText.width + padd;
    cursorText.setPosition(-w / 2 + padd / 2, cursorY - 4, -0.3);
    cursorTextBgRect.setPosition(-w / 2, cursorY, -0.1);
    cursorTextBgRect.setSize(w, 18, 0.01);
    cursorText.text = "" + Math.floor(tl.tl.cursorTime / beatDuration);

    const off = inOffset.get();

    for (let i = 0; i < rects.length; i++)
    {
        const t = (i + firstBeat) * beatDuration + off;
        const rectX = tl.tl.view.timeToPixelScreen(t);
        const rectW = tl.tl.view.timeToPixel(beatDuration) - 1;
        const cursorX = tl.tl.view.timeToPixel(tl.tl.cursorTime - tl.tl.view.offset);

        if (t < 0)rects[i].setColor(0.2, 0.2, 0.2, 0);
        else if ((i + firstBeat) % 4 == 0) rects[i].setColor(0.5, 0.5, 0.5, 1);
        else rects[i].setColor(0.3, 0.3, 0.3, 1);

        if (cursorX > rectX && cursorX < rectX + rectW)
        {
            activeRect.setColor(0.8, 0.8, 0.8, 1);

            activeRect.setShape(4);
            // tl.tl.setColorRectSpecial(activeRect);
            activeRect.setSize(rectW, tl.animLine.drawAreaHeight);
            activeRect.setPosition(rectX, tl.animLine.posY(), -0.1);
        }
        rects[i].setSize(rectW, tl.animLine.drawAreaHeight);
        rects[i].setPosition(rectX, tl.animLine.posY(), -0.1);
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
    if (activeRect)activeRect.dispose();
    if (cursorTextBgRect)cursorTextBgRect.dispose();
    if (cursorText)cursorText.dispose();
    disposeRects();

    animPort.renderTimeLine = null;
};
