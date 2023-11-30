const
    outWidth = op.outNumber("clientWidth"),
    outHeight = op.outNumber("clientHeight"),
    outHeightBody = op.outNumber("body scroll Height"),
    outdevicePixelRatio = op.outNumber("Device Pixel Ratio", 1),
    outIframeChild = op.outBoolNum("Iframe Parent", window.top != window.self),
    outOrientationAngle = op.outNumber("Orientation Angle", 0),
    outOrientationType = op.outString("Orientation Type", "");

window.addEventListener("resize", update);
op.patch.cgl.addEventListener("resize", update);

const mqString = `(resolution: ${window.devicePixelRatio}dppx)`;
const media = matchMedia(mqString);
media.addEventListener("change", update);

update();

function update()
{
    outWidth.set(window.innerWidth);
    outHeight.set(window.innerHeight);
    outdevicePixelRatio.set(window.devicePixelRatio);
    outHeightBody.set(document.documentElement.scrollHeight);

    if (window.screen && window.screen.orientation)
    {
        outOrientationAngle.set(window.screen.orientation.angle || 0);
        outOrientationType.set(window.screen.orientation.type || "");
    }
}
