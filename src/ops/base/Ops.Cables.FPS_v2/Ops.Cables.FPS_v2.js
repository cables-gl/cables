const
    outFPS = op.outNumber("FPS"),
    outMS = op.outNumber("MS");

const listener = op.patch.cgl.fpsCounter.addEventListener("performance", update);

op.onDelete = function ()
{
    op.patch.removeEventListener(listener);
};

function update(p)
{
    outFPS.set(p.fps);
    outMS.set(p.ms);
}
