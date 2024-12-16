const
    inCanv1 = op.inUrl("Image 1"),
    inCanv2 = op.inUrl("Image 2"),
    inStart = op.inTriggerButton("Start"),

    outImageUrl = op.outString("Difference Image"),
    outMatchPercentage = op.outNumber("Mismatch Percentage"),
    outSameDimensions = op.outBoolNum("Same Dimensions"),
    outData = op.outObject("Resemble Data"),
    outFinished = op.outTrigger("Finished");

let finished = true;
let loadingId = 0;
inStart.onTriggered = compare;

function compare()
{
    if (!finished)
    {
        return;
    }

    finished = false;

    if (loadingId)loadingId = op.patch.loading.finished(loadingId);

    loadingId = op.patch.loading.start(op.name, CABLES.uuid(), op);

    resemble(inCanv1.get())
        .compareTo(inCanv2.get())
        .onComplete(
            (data) =>
            {
                if (data.getImageDataUrl) outImageUrl.set(data.getImageDataUrl());
                outSameDimensions.set(data.isSameDimensions);
                outMatchPercentage.set(data.rawMisMatchPercentage);
                outData.set(data);
                outFinished.trigger();
                finished = true;
                loadingId = op.patch.loading.finished(loadingId);
            });
}
