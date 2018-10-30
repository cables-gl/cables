const onResize=op.outTrigger("Resized");

op.patch.cgl.addEventListener("resize",resize);

function resize()
{
    onResize.trigger();
}
