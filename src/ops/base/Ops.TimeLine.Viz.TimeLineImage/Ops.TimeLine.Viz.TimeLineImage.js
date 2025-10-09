const
    inslot = op.inInt("slot", 0),
    filename = op.inUrl("File", [".jpg", ".png", ".webp", ".jpeg", ".avif"]),
    animPort = op.inObject("Test"),
    inStart = op.inFloat("Start", 1),
    inEnd = op.inFloat("End", 7);

animPort.setUiAttribs({ "hidePort": true, "tlDrawKeys": false });

animPort.setAnimated(true);
animPort.anim.setUiAttribs({ "height": 2 });
let rect = null;
let tex = null;
let loadingId = null;
let texSlot = 0;

filename.onChange = () =>
{
    tex = null;// should be disposed in correct context...
};

animPort.renderTimeLine = (tl) =>
{
    texSlot = inslot.get();
    const cgl = tl.cgl;
    if (!cgl)
    {
        console.log("cgl", cgl);
        return;
    }
    if (!rect)
    {
        rect = tl.rectInstancer.createRect();
    }
    if (!tex)
    {
        loadingId = op.patch.loading.start(op.objName, filename.get(), op);
        let url = op.patch.getFilePath(String(filename.get()));

        tex = CGL.Texture.load(cgl, url, (err, t) =>
        {
            console.log("loaded image", url);

            op.patch.loading.finished(loadingId);
        }, { "flip": false, "filter": CGL.Texture.FILTER_LINEAR });
    }
    else
    {
    }

    tl.rectInstancer.setTexture(texSlot, tex);
    rect.setTexture(texSlot);

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
    if (rect)rect.dispose();
}

op.onDelete = () =>
{
    disposeRects();

    animPort.renderTimeLine = null;
};
