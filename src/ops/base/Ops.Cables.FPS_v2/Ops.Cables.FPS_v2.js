const
    active = op.inBool("Active", true),
    outFPS = op.outNumber("FPS"),
    outMS = op.outNumber("MS");

op.onDelete = function ()
{
    op.patch.removeEventListener("performance", update);
};

function update(p)
{
    if (active.get())
    {
        outFPS.set(p.fps);
        outMS.set(p.ms);
    }
}

op.patch.addEventListener("performance", update);
