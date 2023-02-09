const
    outWidth = op.outNumber("clientWidth"),
    outHeight = op.outNumber("clientHeight"),
    outHeightBody = op.outNumber("body scroll Height"),
    outdevicePixelRatio = op.outNumber("Device Pixel Ratio", 1),
    outIframeChild = op.outBoolNum("Iframe Parent", window.top != window.self);

window.addEventListener("resize", update);

update();

function update()
{
    outWidth.set(window.innerWidth);
    outHeight.set(window.innerHeight);

    outdevicePixelRatio.set(window.devicePixelRatio);

    outHeightBody.set(document.documentElement.scrollHeight);
}
