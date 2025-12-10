const
    inEle = op.inObject("Element", null, "element"),
    outImage = op.outString("Image dataUrl"),
    inUpdate = op.inTriggerButton("Update"),
    outProg = op.outNumber("Progress"),
    outFinished = op.outTrigger("Finished");

op.toWorkPortsNeedToBeLinked(inEle);
let loadingId = null;

inUpdate.onTriggered = () =>
{
    if (loadingId)loadingId = op.patch.loading.finished(loadingId);

    loadingId = op.patch.loading.start(op.objName, "screenshot" + CABLES.uuid(), op);

    if (!inEle.get()) return;

    modernScreenshot
        .domToImage(inEle.get(), {
            "debug": true,
            "progress": (current, total) =>
            {
                outProg.set(current / total);
                // console.log(`${current}/${total}`)
            }
        })
        .then((img) =>
        {
        // console.log("finished....",img);

            outImage.set(img.src);
            loadingId = op.patch.loading.finished(loadingId);
            outFinished.trigger();
        });
};
