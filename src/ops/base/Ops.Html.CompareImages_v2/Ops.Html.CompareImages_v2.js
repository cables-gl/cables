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
let canceled = false;
let to = null;
inStart.onTriggered = compare;

op.onDelete = () =>
{
    clearTimeout(to);
};

function compare()
{
    if (!finished)
    {
        // console.log("waiting");
        clearTimeout(to);
        canceled = true;
        to = setTimeout(compare, 50);
        return;
    }

    clearTimeout(to);

    finished = false;

    if (loadingId)loadingId = op.patch.loading.finished(loadingId);
    let startTime = performance.now();

    loadingId = op.patch.loading.start(op.name, CABLES.uuid(), op);
    canceled = false;
    try
    {
        resemble(inCanv2.get())
            .compareTo(inCanv1.get())
            .onComplete(
                (data) =>
                {
                    if (canceled)
                    {
                        finished = true;
                        compare();
                        return;
                    }
                    if (data.getImageDataUrl) outImageUrl.set(data.getImageDataUrl());
                    outSameDimensions.set(data.isSameDimensions);
                    outMatchPercentage.set(data.rawMisMatchPercentage);
                    outData.setRef(data);
                    loadingId = op.patch.loading.finished(loadingId);
                    outFinished.trigger();

                    finished = true;
                    clearTimeout(to);
                });
    }
    catch (e)
    {
        // console.log("eeeee", e.message);
        clearTimeout(to);
        finished = true;

        to = setTimeout(compare, 100);
    }
}
