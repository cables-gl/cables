const
    active = op.inBool("Active", true),
    outFPS = op.outNumber("FPS"),
    outMS = op.outNumber("MS");

const listener = op.patch.addEventListener("performance", update);

op.onDelete = function ()
{
    op.patch.removeEventListener(listener);
};

function update(p)
{
    if (active.get())
    {
        outFPS.set(p.fps);
        outMS.set(p.ms);
    }
}
