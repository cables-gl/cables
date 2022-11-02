const
    outWidth = op.outNumber("clientWidth"),
    outHeight = op.outNumber("clientHeight"),
    outHeightBody = op.outNumber("body scroll Height");

window.addEventListener("resize", update);

update();

function update()
{
    outWidth.set(window.innerWidth);
    outHeight.set(window.innerHeight);

    outHeightBody.set(document.documentElement.scrollHeight);
}
