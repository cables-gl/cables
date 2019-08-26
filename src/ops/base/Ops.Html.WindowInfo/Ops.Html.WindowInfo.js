const
    outWidth=op.outNumber("clientWidth"),
    outHeight=op.outNumber("clientHeight");


window.addEventListener('resize', update);

update();

function update()
{
    outWidth.set(window.innerWidth);
    outHeight.set(window.innerHeight);
}

