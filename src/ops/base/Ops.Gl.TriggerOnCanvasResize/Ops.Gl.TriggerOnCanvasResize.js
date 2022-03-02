const onResize = op.outTrigger("Resized");

op.patch.cgl.on("resize", resize);

function resize()
{
    onResize.trigger();
}
