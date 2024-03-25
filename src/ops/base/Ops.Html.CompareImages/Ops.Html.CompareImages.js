const
    inCanv1 = op.inUrl("Image 1"),
    inCanv2 = op.inUrl("Image 2"),

    outImageUrl = op.outString("Difference Image"),
    outMatchPercentage = op.outNumber("Mismatch Percentage"),
    outSameDimensions = op.outBoolNum("Same Dimensions"),
    outFinished = op.outTrigger("Finished");

const img1 = new Image();
const img2 = new Image();

img2.onload =
img1.onload = compare;

inCanv1.onChange = () =>
{
    img1.src = inCanv1.get();
};

inCanv2.onChange = () =>
{
    img2.src = inCanv2.get();
};

function compare()
{
    resemble(img1.src)
        .compareTo(img2.src)
        .onComplete(
            (data) =>
            {
                console.log(data);
                if (data.getImageDataUrl) outImageUrl.set(data.getImageDataUrl());
                outSameDimensions.set(data.isSameDimensions);
                outMatchPercentage.set(data.rawMisMatchPercentage);
                outFinished.trigger();
            });
}
